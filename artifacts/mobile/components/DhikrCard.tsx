import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BUNDLED_AUDIO, CARD_COLORS, TEXT_COLORS, useApp } from "@/context/AppContext";
import type { Dhikr } from "@/context/AppContext";
import { Icon } from "@/components/Icon";

interface Props {
  item: Dhikr;
  onEdit: (item: Dhikr) => void;
  onFadeComplete?: (id: string) => void;
}

export function DhikrCard({ item, onEdit, onFadeComplete }: Props) {
  const { settings, decrementCount, recordings, saveRecording, deleteRecording, speakDhikr, speakingId } = useApp();
  const { theme, bgColor, fontSize } = settings;

  const cardC = CARD_COLORS[theme][bgColor];
  const textC = TEXT_COLORS[theme];
  const mutedC = theme === "day" ? "#6B7280" : "#9CA3AF";
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const redC = "#EF4444";
  const borderC = theme === "day" ? "#E0E0E0" : "#333333";

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isDone = item.currentCount === 0;
  const hasBundledAudio = !!BUNDLED_AUDIO[item.id];
  const hasUserRecording = !!recordings[item.id];
  const hasRecording = hasUserRecording || hasBundledAudio;

  const [hidden, setHidden] = useState(isDone);
  const [isRecording, setIsRecording] = useState(false);
  const prevIsDoneRef = useRef(isDone);

  const [isPlaying, setIsPlaying] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isPlayingRef = useRef(false);
  const remainingRef = useRef(0);

  useEffect(() => {
    if (isDone && !prevIsDoneRef.current) {
      isPlayingRef.current = false;
      remainingRef.current = 0;
      if (soundRef.current) {
        soundRef.current.stopAsync().then(() => soundRef.current?.unloadAsync());
        soundRef.current = null;
      }
      setIsPlaying(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setHidden(true);
          onFadeComplete?.(item.id);
        }
      });
    } else if (!isDone) {
      fadeAnim.setValue(1);
      setHidden(false);
    }
    prevIsDoneRef.current = isDone;
  }, [isDone, fadeAnim]);

  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handlePress = () => {
    if (isDone) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    decrementCount(item.id);
  };

  const handlePlay = async () => {
    if (!hasRecording) return;
    try {
      if (isPlaying) {
        isPlayingRef.current = false;
        remainingRef.current = 0;
        await soundRef.current?.stopAsync();
        await soundRef.current?.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
        return;
      }

      const audioSource: import("expo-av").AVPlaybackSource = hasUserRecording
        ? { uri: recordings[item.id] }
        : BUNDLED_AUDIO[item.id];

      const playOnce = () => {
        if (!isPlayingRef.current || remainingRef.current <= 0) {
          isPlayingRef.current = false;
          setIsPlaying(false);
          return;
        }
        Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true })
          .then(() => Audio.Sound.createAsync(audioSource))
          .then(({ sound }) => {
            soundRef.current = sound;
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
                soundRef.current = null;
                remainingRef.current -= 1;
                decrementCount(item.id);
                if (isPlayingRef.current && remainingRef.current > 0) {
                  setTimeout(playOnce, 300);
                } else {
                  isPlayingRef.current = false;
                  setIsPlaying(false);
                }
              }
            });
            sound.playAsync();
          })
          .catch(() => {
            isPlayingRef.current = false;
            setIsPlaying(false);
          });
      };

      isPlayingRef.current = true;
      remainingRef.current = item.currentCount;
      setIsPlaying(true);
      playOnce();
    } catch {
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  };

  const handleMic = async () => {
    if (isRecording) {
      try {
        await recordingRef.current?.stopAndUnloadAsync();
        const uri = recordingRef.current?.getURI();
        if (uri) {
          saveRecording(item.id, uri);
        }
        recordingRef.current = null;
      } catch {}
      setIsRecording(false);
    } else {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) return;
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recordingRef.current = recording;
        setIsRecording(true);
      } catch {}
    }
  };

  const handleDeleteRecording = () => {
    deleteRecording(item.id);
  };

  if (hidden) return <View style={{ height: 0 }} />;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.card,
          {
            backgroundColor: cardC,
            borderColor: isDone ? primaryC : borderC,
            borderWidth: isDone ? 1.5 : 1,
            opacity: isDone ? 0.65 : 1,
          },
        ]}
      >
        <Text
          selectable={false}
          style={[
            styles.dhikrText,
            {
              fontSize,
              color: isDone ? mutedC : textC,
              lineHeight: fontSize * 1.8,
            },
          ]}
        >
          {item.text}
        </Text>

        <View style={[styles.bottomBar, { borderTopColor: borderC }]}>
          {/* TTS button — hidden for Quran verses */}
          {!item.isQuran && (
            <TouchableOpacity
              onPress={() => speakDhikr(item.id, item.text, item.currentCount)}
              style={[styles.iconBtn, { backgroundColor: speakingId === item.id ? primaryC + "33" : mutedC + "18" }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="speaker" size={18} color={speakingId === item.id ? primaryC : mutedC} />
            </TouchableOpacity>
          )}

          {hasRecording && !isRecording && (
            <TouchableOpacity
              onPress={handlePlay}
              style={[styles.iconBtn, { backgroundColor: isPlaying ? primaryC + "33" : primaryC + "18" }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name={isPlaying ? "pause" : "volume-2"} size={18} color={primaryC} />
            </TouchableOpacity>
          )}

          <Animated.View style={[styles.micRow, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              onPress={handleMic}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isRecording
                    ? redC + "22"
                    : hasRecording
                    ? primaryC + "22"
                    : mutedC + "18",
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon
                name={isRecording ? "square" : "mic"}
                size={16}
                color={isRecording ? redC : hasRecording ? primaryC : mutedC}
              />
            </TouchableOpacity>
            <Text style={[styles.micLabel, { color: isRecording ? redC : hasRecording ? primaryC : mutedC }]}>
              {isRecording ? "اضغط للإيقاف" : "إستمع الي الذكر بصوتك"}
            </Text>
          </Animated.View>

          <View style={styles.rightActions}>
            {hasRecording && !isRecording && (
              <TouchableOpacity
                onPress={handleDeleteRecording}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.actionBtn}
              >
                <Icon name="x-circle" size={14} color={redC} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => onEdit(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.actionBtn}
            >
              <Icon name="edit-2" size={14} color={mutedC} />
            </TouchableOpacity>
            {isDone ? (
              <View style={[styles.countBadge, { backgroundColor: primaryC }]}>
                <Icon name="check" size={13} color="#fff" />
              </View>
            ) : (
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: primaryC + "22", borderColor: primaryC + "44", borderWidth: 1 },
                ]}
              >
                <Text style={[styles.countText, { color: primaryC }]}>
                  {item.currentCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {isRecording && (
          <View style={[styles.recordingBanner, { backgroundColor: redC + "15" }]}>
            <Icon name="mic" size={12} color={redC} />
            <Text style={[styles.recordingText, { color: redC }]}>جارٍ التسجيل... اضغط ■ للإيقاف</Text>
          </View>
        )}
        {hasUserRecording && !isRecording && (
          <View style={[styles.recordingBanner, { backgroundColor: primaryC + "12" }]}>
            <Icon name="check-circle" size={12} color={primaryC} />
            <Text style={[styles.recordingText, { color: primaryC }]}>تم تسجيل صوتك بنجاح ✓</Text>
          </View>
        )}
        {!hasUserRecording && hasBundledAudio && !isRecording && (
          <View style={[styles.recordingBanner, { backgroundColor: primaryC + "12" }]}>
            <Icon name="volume-2" size={12} color={primaryC} />
            <Text style={[styles.recordingText, { color: primaryC }]}>يتوفر صوت مرفق</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  dhikrText: {
    fontFamily: Platform.OS === "ios" ? "System" : undefined,
    textAlign: "center",
    writingDirection: "rtl",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    lineHeight: 34,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
  },
  actionBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  micRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  micLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  recordingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
});
