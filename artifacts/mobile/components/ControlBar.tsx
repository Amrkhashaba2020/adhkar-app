import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BG_COLORS,
  TEXT_COLORS,
  useApp,
  type BgColorKey,
} from "@/context/AppContext";

const COLOR_OPTIONS: { key: BgColorKey; dayColor: string; label: string }[] = [
  { key: "white", dayColor: "#FFFFFF", label: "أبيض" },
  { key: "cream", dayColor: "#FEF9EF", label: "كريمي" },
  { key: "mint", dayColor: "#E8F5E8", label: "أخضر" },
];

export function ControlBar() {
  const insets = useSafeAreaInsets();
  const {
    settings,
    updateSettings,
    isPlayingAll,
    speakAll,
    stopSpeaking,
    activeCategory,
    resetCategory,
  } = useApp();

  const { theme, bgColor, fontSize } = settings;
  const textC = TEXT_COLORS[theme];
  const barBg =
    theme === "day" ? "rgba(255,255,255,0.95)" : "rgba(20,20,40,0.97)";
  const borderC = theme === "day" ? "#E0E0E0" : "#333333";
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const mutedC = theme === "day" ? "#9CA3AF" : "#6B7280";

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: barBg,
          borderBottomColor: borderC,
          paddingTop: topPad + 8,
        },
      ]}
    >
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() =>
            updateSettings({ theme: theme === "day" ? "night" : "day" })
          }
          style={[styles.iconBtn, { borderColor: borderC }]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather
            name={theme === "day" ? "moon" : "sun"}
            size={18}
            color={textC}
          />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: borderC }]} />

        {COLOR_OPTIONS.map((opt) => {
          const circleColor =
            theme === "day"
              ? opt.dayColor
              : BG_COLORS["night"][opt.key];
          const isSelected = bgColor === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => updateSettings({ bgColor: opt.key })}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: circleColor,
                  borderColor: isSelected ? primaryC : borderC,
                  borderWidth: isSelected ? 2.5 : 1,
                },
              ]}
            />
          );
        })}

        <View style={[styles.divider, { backgroundColor: borderC }]} />

        <TouchableOpacity
          onPress={isPlayingAll ? stopSpeaking : speakAll}
          style={[
            styles.iconBtn,
            {
              borderColor: isPlayingAll ? primaryC : borderC,
              backgroundColor: isPlayingAll ? primaryC + "22" : "transparent",
            },
          ]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather
            name={isPlayingAll ? "pause" : "headphones"}
            size={18}
            color={isPlayingAll ? primaryC : textC}
          />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: borderC }]} />

        <TouchableOpacity
          onPress={() =>
            updateSettings({ fontSize: Math.max(14, fontSize - 2) })
          }
          style={[styles.iconBtn, { borderColor: borderC }]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={[styles.fontBtnText, { color: textC, fontSize: 13 }]}>
            ا-
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            updateSettings({ fontSize: Math.min(28, fontSize + 2) })
          }
          style={[styles.iconBtn, { borderColor: borderC }]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={[styles.fontBtnText, { color: textC, fontSize: 17 }]}>
            ا+
          </Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: borderC }]} />

        <TouchableOpacity
          onPress={() => resetCategory(activeCategory)}
          style={[styles.iconBtn, { borderColor: borderC }]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="refresh-cw" size={16} color={mutedC} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "nowrap",
    justifyContent: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 2,
  },
  fontBtnText: {
    fontWeight: "700" as const,
  },
});
