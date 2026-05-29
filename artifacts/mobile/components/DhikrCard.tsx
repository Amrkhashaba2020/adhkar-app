import { Feather } from "@expo/vector-icons";
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
import { BG_COLORS, CARD_COLORS, TEXT_COLORS, useApp } from "@/context/AppContext";
import type { Dhikr } from "@/context/AppContext";

interface Props {
  item: Dhikr;
  onEdit: (item: Dhikr) => void;
}

export function DhikrCard({ item, onEdit }: Props) {
  const { settings, decrementCount, deleteDhikr, recordings, saveRecording, deleteRecording } = useApp();
  const { theme, bgColor, fontSize } = settings;

  const bgC = BG_COLORS[theme][bgColor];
  const cardC = CARD_COLORS[theme][bgColor];
  const textC = TEXT_COLORS[theme];
  const mutedC = theme === "day" ? "#6B7280" : "#9CA3AF";
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const redC = "#EF4444";
  const borderC = theme === "day" ? "#E0E0E0" : "#333333";

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isDone = item.currentCount === 0;
  const hasRecording = !!recordings[item.id];

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

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
    if (!recordings[item.id]) return;
    try {
      if (isPlaying) {
        await soundRef.current?.stopAsync();
        await soundRef.current?.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: recordings[item.id] });
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
      await sound.playAsync();
    } catch {
      setIsPlaying(false);
    }
  };

  const handleMic = async () => {
    if (isRecording) {
      // Stop recording
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
      // Start recording
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

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
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
          {/* Play button: only shown when recording exists */}
          {hasRecording && !isRecording && (
            <TouchableOpacity
              onPress={handlePlay}
              style={[styles.iconBtn, { backgroundColor: isPlaying ? primaryC + "33" : primaryC + "18" }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name={isPlaying ? "pause" : "volume-2"} size={18} color={primaryC} />
            </TouchableOpacity>
          )}

          {/* Mic button: record / stop */}
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
              <Feather
                name={isRecording ? "square" : "mic"}
                size={16}
                color={isRecording ? redC : hasRecording ? primaryC : mutedC}
              />
            </TouchableOpacity>
            <Text style={[styles.micLabel, { color: isRecording ? redC : hasRecording ? primaryC : mutedC }]}>
              {isRecording ? "اضغط للإيقاف" : "قم بقراءة الذكر بصوتك"}
            </Text>
          </Animated.View>

          <View style={styles.rightActions}>
            {hasRecording && !isRecording && (
              <TouchableOpacity
                onPress={handleDeleteRecording}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.actionBtn}
              >
                <Feather name="x-circle" size={14} color={redC} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => onEdit(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.actionBtn}
            >
              <Feather name="edit-2" size={14} color={mutedC} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteDhikr(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.actionBtn}
            >
              <Feather name="trash-2" size={14} color={redC} />
            </TouchableOpacity>
            {isDone ? (
              <View style={[styles.countBadge, { backgroundColor: primaryC }]}>
                <Feather name="check" size={13} color="#fff" />
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
            <Feather name="mic" size={12} color={redC} />
            <Text style={[styles.recordingText, { color: redC }]}>جارٍ التسجيل... اضغط ■ للإيقاف</Text>
          </View>
        )}
        {hasRecording && !isRecording && (
          <View style={[styles.recordingBanner, { backgroundColor: primaryC + "12" }]}>
            <Feather name="check-circle" size={12} color={primaryC} />
            <Text style={[styles.recordingText, { color: primaryC }]}>تم تسجيل صوتك بنجاح ✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  dhikrText: {
    fontFamily: Platform.OS === "ios" ? "System" : undefined,
    textAlign: "right",
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
