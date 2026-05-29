import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useRef } from "react";
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
  const { settings, decrementCount, speakDhikr, deleteDhikr } = useApp();
  const { theme, bgColor, fontSize } = settings;

  const bgC = BG_COLORS[theme][bgColor];
  const cardC = CARD_COLORS[theme][bgColor];
  const textC = TEXT_COLORS[theme];
  const mutedC = theme === "day" ? "#6B7280" : "#9CA3AF";
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const borderC = theme === "day" ? "#E0E0E0" : "#333333";

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDone = item.currentCount === 0;

  const handlePress = () => {
    if (isDone) return;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    decrementCount(item.id);
  };

  const handleSpeak = () => {
    speakDhikr(item.text);
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
            opacity: isDone ? 0.7 : 1,
          },
        ]}
      >
        {isDone && (
          <View style={[styles.doneBadge, { backgroundColor: primaryC }]}>
            <Feather name="check" size={12} color="#fff" />
          </View>
        )}

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
          <TouchableOpacity
            onPress={handleSpeak}
            style={[styles.speakBtn, { backgroundColor: primaryC + "18" }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="volume-2" size={18} color={primaryC} />
          </TouchableOpacity>

          <View style={styles.rightActions}>
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
              <Feather name="trash-2" size={14} color="#EF4444" />
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
  doneBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  speakBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
});
