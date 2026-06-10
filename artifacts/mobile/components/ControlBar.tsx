import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
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
import { Icon } from "@/components/Icon";
import { HistoryModal } from "@/components/HistoryModal";

const COLOR_OPTIONS: { key: BgColorKey; dayColor: string; nightColor: string; label: string }[] = [
  { key: "white", dayColor: "#FFFFFF", nightColor: "#1C1F2E", label: "أبيض" },
  { key: "cream", dayColor: "#FBF3E0", nightColor: "#221C0E", label: "كريمي" },
  { key: "mint", dayColor: "#E8F5E8", nightColor: "#0E1F0E", label: "أخضر" },
];

function pad(n: number) { return n.toString().padStart(2, "0"); }

export function ControlBar() {
  const insets = useSafeAreaInsets();
  const {
    settings,
    updateSettings,
    activeCategory,
    resetCategory,
    isPlayingAll,
    speakAll,
    stopSpeaking,
    dailyStats,
    completionHistory,
  } = useApp();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { theme, bgColor, fontSize } = settings;
  const textC = TEXT_COLORS[theme];
  const barBg = theme === "day" ? "rgba(255,255,255,0.97)" : "rgba(12,14,24,0.97)";
  const borderC = theme === "day" ? "#E5E7EB" : "#2A2D3E";
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const mutedC = theme === "day" ? "#9CA3AF" : "#6B7280";
  const modalBg = theme === "day" ? "#FFFFFF" : "#131520";
  const sectionBg = theme === "day" ? "#F9FAFB" : "#1C1F2E";

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 8) : insets.top;


  const todayMorning = dailyStats.morningCount;
  const todayEvening = dailyStats.eveningCount;

  return (
    <>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: barBg,
            borderBottomColor: borderC,
            paddingTop: topPad + 2,
          },
        ]}
      >
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => updateSettings({ theme: theme === "day" ? "night" : "day" })}
            style={[styles.iconBtn, { borderColor: borderC }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name={theme === "day" ? "moon" : "sun"} size={18} color={textC} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: borderC }]} />

          {COLOR_OPTIONS.map((opt) => {
            const circleColor = theme === "day" ? opt.dayColor : opt.nightColor;
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
            <Icon name={isPlayingAll ? "pause" : "headphones"} size={18} color={isPlayingAll ? primaryC : textC} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: borderC }]} />

          <TouchableOpacity
            onPress={() => updateSettings({ fontSize: Math.max(14, fontSize - 2) })}
            style={[styles.iconBtn, { borderColor: borderC }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[styles.fontBtnText, { color: textC, fontSize: 16, lineHeight: 18, includeFontPadding: false }]}>ب</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => updateSettings({ fontSize: Math.min(28, fontSize + 2) })}
            style={[styles.iconBtn, { borderColor: borderC }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[styles.fontBtnText, { color: textC, fontSize: 24, lineHeight: 26, includeFontPadding: false }]}>ب</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: borderC }]} />

          <TouchableOpacity
            onPress={() => resetCategory(activeCategory)}
            style={[styles.iconBtn, { borderColor: borderC }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="refresh-cw" size={16} color={mutedC} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSettingsOpen(true)}
            style={[styles.iconBtn, { borderColor: borderC }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="settings" size={16} color={mutedC} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setHistoryOpen(true)}
            style={[styles.iconBtn, { borderColor: borderC }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="calendar" size={16} color={mutedC} />
          </TouchableOpacity>
        </View>

        {(() => {
          const today = new Date();
          const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const todayRecord = completionHistory.find((r) => r.date === todayKey);
          const morningDone = todayRecord?.morning ?? false;
          const eveningDone = todayRecord?.evening ?? false;
          return (
            <View style={styles.todayWidget}>
              <View style={[styles.todayItem, { backgroundColor: eveningDone ? "#000000" : "#666666" }]}>
                <Icon name="moon-filled" size={13} color="#FFFFFF" />
                <Text style={[styles.todayItemText, { color: eveningDone ? "#A5B4FC" : "#FFFFFF" }]}>
                  {eveningDone ? "مكتمل" : "لم يكتمل"}
                </Text>
              </View>
              <View style={[styles.todayItem, { backgroundColor: morningDone ? primaryC + "18" : borderC + "44" }]}>
                <Text style={styles.todayEmoji}>☀️</Text>
                <Text style={[styles.todayItemText, { color: morningDone ? primaryC : mutedC }]}>
                  {morningDone ? "مكتمل" : "لم يكتمل"}
                </Text>
              </View>
            </View>
          );
        })()}
      </View>

      <Modal
        visible={settingsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSettingsOpen(false)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: modalBg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHandle, { backgroundColor: borderC }]} />
            <View style={[styles.modalHeader, { borderBottomColor: borderC }]}>
              <Text style={[styles.modalTitle, { color: textC }]}>الإعدادات</Text>
              <TouchableOpacity onPress={() => setSettingsOpen(false)}>
                <Icon name="x" size={22} color={mutedC} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <View style={[styles.section, { backgroundColor: sectionBg, borderColor: borderC }]}>
                <Text style={[styles.sectionTitle, { color: mutedC }]}>التذكيرات اليومية</Text>

                <View style={[styles.settingRow, { borderBottomColor: borderC }]}>
                  <View style={styles.settingLabel}>
                    <Text style={[styles.settingText, { color: textC }]}>تفعيل الإشعارات</Text>
                    <Text style={[styles.settingHint, { color: mutedC }]}>تذكير يومي بأذكار الصباح والمساء</Text>
                  </View>
                  <Switch
                    value={settings.notificationsEnabled}
                    onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
                    trackColor={{ false: borderC, true: primaryC + "88" }}
                    thumbColor={settings.notificationsEnabled ? primaryC : mutedC}
                  />
                </View>

                {settings.notificationsEnabled && (
                  <>
                    <View style={[styles.settingRow, { borderBottomColor: borderC }]}>
                      <View style={styles.settingLabel}>
                        <Text style={[styles.settingText, { color: textC }]}>🌅 وقت أذكار الصباح</Text>
                      </View>
                      <View style={styles.timeControl}>
                        <TouchableOpacity
                          onPress={() => updateSettings({ morningNotifHour: (settings.morningNotifHour + 1) % 24 })}
                          style={[styles.timeBtn, { borderColor: borderC }]}
                        >
                          <Icon name="chevron-up" size={14} color={primaryC} />
                        </TouchableOpacity>
                        <Text style={[styles.timeText, { color: textC }]}>
                          {pad(settings.morningNotifHour)}:{pad(settings.morningNotifMinute)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateSettings({ morningNotifHour: (settings.morningNotifHour - 1 + 24) % 24 })}
                          style={[styles.timeBtn, { borderColor: borderC }]}
                        >
                          <Icon name="chevron-down" size={14} color={primaryC} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.timeControl}>
                        <TouchableOpacity
                          onPress={() => updateSettings({ morningNotifMinute: (settings.morningNotifMinute + 5) % 60 })}
                          style={[styles.timeBtn, { borderColor: borderC }]}
                        >
                          <Icon name="chevron-up" size={14} color={primaryC} />
                        </TouchableOpacity>
                        <Text style={[styles.timeText, { color: mutedC }]}>دقيقة</Text>
                        <TouchableOpacity
                          onPress={() => updateSettings({ morningNotifMinute: (settings.morningNotifMinute - 5 + 60) % 60 })}
                          style={[styles.timeBtn, { borderColor: borderC }]}
                        >
                          <Icon name="chevron-down" size={14} color={primaryC} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[styles.settingRow]}>
                      <View style={styles.settingLabel}>
                        <Text style={[styles.settingText, { color: textC }]}>🌙 وقت أذكار المساء</Text>
                      </View>
                      <View style={styles.timeControl}>
                        <TouchableOpacity
                          onPress={() => updateSettings({ eveningNotifHour: (settings.eveningNotifHour + 1) % 24 })}
                          style={[styles.timeBtn, { borderColor: borderC }]}
                        >
                          <Icon name="chevron-up" size={14} color={primaryC} />
                        </TouchableOpacity>
                        <Text style={[styles.timeText, { color: textC }]}>
                          {pad(settings.eveningNotifHour)}:{pad(settings.eveningNotifMinute)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateSettings({ eveningNotifHour: (settings.eveningNotifHour - 1 + 24) % 24 })}
                          style={[styles.timeBtn, { borderColor: borderC }]}
                        >
                          <Icon name="chevron-down" size={14} color={primaryC} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.timeControl}>
                        <TouchableOpacity
                          onPress={() => updateSettings({ eveningNotifMinute: (settings.eveningNotifMinute + 5) % 60 })}
                          style={[styles.timeBtn, { borderColor: borderC }]}
                        >
                          <Icon name="chevron-up" size={14} color={primaryC} />
                        </TouchableOpacity>
                        <Text style={[styles.timeText, { color: mutedC }]}>دقيقة</Text>
                        <TouchableOpacity
                          onPress={() => updateSettings({ eveningNotifMinute: (settings.eveningNotifMinute - 5 + 60) % 60 })}
                          style={[styles.timeBtn, { borderColor: borderC }]}
                        >
                          <Icon name="chevron-down" size={14} color={primaryC} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>

              <View style={[styles.section, { backgroundColor: sectionBg, borderColor: borderC }]}>
                <Text style={[styles.sectionTitle, { color: mutedC }]}>إحصائيات اليوم</Text>
                <View style={styles.statsGrid}>
                  <View style={[styles.statCard, { backgroundColor: primaryC + "14", borderColor: primaryC + "30" }]}>
                    <Text style={styles.statEmoji}>☀️</Text>
                    <Text style={[styles.statNumber, { color: primaryC }]}>{dailyStats.morningCount}</Text>
                    <Text style={[styles.statName, { color: mutedC }]}>أذكار الصباح</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: "#000000", borderColor: "#33333380" }]}>
                    <Icon name="moon-filled" size={28} color="#FFFFFF" />
                    <Text style={[styles.statNumber, { color: "#FFFFFF" }]}>{dailyStats.eveningCount}</Text>
                    <Text style={[styles.statName, { color: "#AAAAAA" }]}>أذكار المساء</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: primaryC + "14", borderColor: primaryC + "30" }]}>
                    <Text style={styles.statEmoji}>📿</Text>
                    <Text style={[styles.statNumber, { color: primaryC }]}>
                      {dailyStats.morningCount + dailyStats.eveningCount}
                    </Text>
                    <Text style={[styles.statName, { color: mutedC }]}>المجموع</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.section, { backgroundColor: sectionBg, borderColor: borderC }]}>
                <Text style={[styles.sectionTitle, { color: mutedC }]}>التطبيق</Text>
                <TouchableOpacity
                  style={[styles.settingRow, { borderBottomWidth: 0 }]}
                  onPress={() => {
                    Share.share({
                      title: "أذكار الصباح والمساء",
                      message:
                        "تطبيق أذكار الصباح والمساء 📿\nاحرص على ذكر الله صباحاً ومساءً\n\nحمّل التطبيق:\nhttps://play.google.com/store/apps/details?id=com.adhkar.morningevening",
                    });
                  }}
                >
                  <View style={styles.settingLabel}>
                    <Text style={[styles.settingText, { color: textC }]}>مشاركة التطبيق</Text>
                    <Text style={[styles.settingHint, { color: mutedC }]}>شارك التطبيق مع أهلك وأصدقائك</Text>
                  </View>
                  <Icon name="share-2" size={18} color={primaryC} />
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <HistoryModal visible={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    height: 22,
    marginHorizontal: 1,
  },
  fontBtnText: {
    fontWeight: "700",
  },
  todayWidget: {
    flexDirection: "row",
    gap: 8,
    marginTop: 7,
    justifyContent: "center",
  },
  todayItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  todayEmoji: {
    fontSize: 13,
  },
  todayItemText: {
    fontSize: 11,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalScroll: {
    padding: 16,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    textAlign: "right",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  settingLabel: {
    flex: 1,
    alignItems: "flex-end",
  },
  settingText: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "right",
  },
  settingHint: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
  },
  timeControl: {
    alignItems: "center",
    gap: 2,
  },
  timeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 36,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 4,
  },
  statEmoji: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
  },
  statName: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});
