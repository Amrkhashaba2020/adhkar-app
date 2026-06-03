import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BG_COLORS, TEXT_COLORS, useApp } from "@/context/AppContext";
import { Icon } from "@/components/Icon";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AR_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildLast30Days(): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    result.push(`${y}-${m}-${day}`);
  }
  return result;
}

function formatArabicDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayName = AR_DAYS[d.getDay()];
  const day = d.getDate();
  const month = AR_MONTHS[d.getMonth()];
  return `${dayName} ${day} ${month}`;
}

export function HistoryModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { settings, completionHistory } = useApp();
  const { theme, bgColor } = settings;

  const bgC = BG_COLORS[theme][bgColor];
  const textC = TEXT_COLORS[theme];
  const modalBg = theme === "day" ? "#FFFFFF" : "#131520";
  const cardBg = theme === "day" ? "#F9FAFB" : "#1C1F2E";
  const borderC = theme === "day" ? "#E5E7EB" : "#2A2D3E";
  const mutedC = theme === "day" ? "#9CA3AF" : "#6B7280";
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const todayColor = theme === "day" ? "#EDF7ED" : "#0D2010";

  const today = todayStr();
  const days = buildLast30Days();
  const recordMap = new Map(completionHistory.map((r) => [r.date, r]));

  const totalDays = days.length;
  const completedBoth = days.filter((d) => {
    const r = recordMap.get(d);
    return r?.morning && r?.evening;
  }).length;
  const completedMorning = days.filter((d) => recordMap.get(d)?.morning).length;
  const completedEvening = days.filter((d) => recordMap.get(d)?.evening).length;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: modalBg, paddingTop: insets.top + 8 }]}>
        <View style={[styles.header, { borderBottomColor: borderC }]}>
          <Text style={[styles.title, { color: textC }]}>السجل اليومي</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="x" size={22} color={mutedC} />
          </Pressable>
        </View>

        <View style={[styles.statsRow, { backgroundColor: cardBg, borderColor: borderC }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: primaryC }]}>{completedBoth}</Text>
            <Text style={[styles.statLabel, { color: mutedC }]}>يوم مكتمل</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: borderC }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: "#F59E0B" }]}>{completedMorning}</Text>
            <Text style={[styles.statLabel, { color: mutedC }]}>☀️ صباح</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: borderC }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: "#6366F1" }]}>{completedEvening}</Text>
            <Text style={[styles.statLabel, { color: mutedC }]}>🌙 مساء</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: borderC }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: textC }]}>{totalDays}</Text>
            <Text style={[styles.statLabel, { color: mutedC }]}>يوم</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {days.map((dateStr) => {
            const isToday = dateStr === today;
            const record = recordMap.get(dateStr);
            const morningDone = record?.morning ?? false;
            const eveningDone = record?.evening ?? false;
            const bothDone = morningDone && eveningDone;

            return (
              <View
                key={dateStr}
                style={[
                  styles.row,
                  {
                    backgroundColor: isToday ? todayColor : cardBg,
                    borderColor: isToday ? primaryC : borderC,
                    borderWidth: isToday ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  {isToday && (
                    <View style={[styles.todayBadge, { backgroundColor: primaryC }]}>
                      <Text style={styles.todayBadgeText}>اليوم</Text>
                    </View>
                  )}
                  <Text style={[styles.dateText, { color: textC }]}>
                    {formatArabicDate(dateStr)}
                  </Text>
                </View>

                <View style={styles.rowRight}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusIcon}>☀️</Text>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: morningDone ? primaryC : (theme === "day" ? "#E5E7EB" : "#2A2D3E") },
                    ]}>
                      {morningDone && <Icon name="check" size={10} color="#fff" />}
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusIcon}>🌙</Text>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: eveningDone ? "#6366F1" : (theme === "day" ? "#E5E7EB" : "#2A2D3E") },
                    ]}>
                      {eveningDone && <Icon name="check" size={10} color="#fff" />}
                    </View>
                  </View>
                  {bothDone && (
                    <View style={[styles.completeBadge, { backgroundColor: primaryC + "22" }]}>
                      <Text style={[styles.completeBadgeText, { color: primaryC }]}>✓ مكتمل</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNum: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    marginHorizontal: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  row: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    gap: 4,
    flex: 1,
  },
  todayBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  todayBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  completeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 4,
  },
  completeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
