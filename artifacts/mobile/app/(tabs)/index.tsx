import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ControlBar } from "@/components/ControlBar";
import { DhikrCard } from "@/components/DhikrCard";
import { EditModal } from "@/components/EditModal";
import { Icon } from "@/components/Icon";
import {
  BG_COLORS,
  TEXT_COLORS,
  useApp,
  type Dhikr,
} from "@/context/AppContext";

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const { adhkar, settings, activeCategory, setActiveCategory } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Dhikr | null>(null);
  const [fadedIds, setFadedIds] = useState<Set<string>>(new Set());

  const { theme, bgColor } = settings;
  const bgC = BG_COLORS[theme][bgColor];
  const textC = TEXT_COLORS[theme];
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const mutedC = theme === "day" ? "#6B7280" : "#9CA3AF";
  const borderC = theme === "day" ? "#E0E0E0" : "#333333";

  const all = adhkar.filter((d) => d.category === activeCategory);
  const displayList = all.filter((d) => !fadedIds.has(d.id));
  const filtered = displayList.filter((d) => d.currentCount > 0);

  const scrollViewRef = useRef<ScrollView>(null);
  // Stores the Y offset of each card relative to ScrollView content
  const cardYRef = useRef<Map<string, number>>(new Map());
  const fadedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fadedIdsRef.current = new Set();
    setFadedIds(new Set());
    cardYRef.current.clear();
  }, [activeCategory]);

  const handleFadeComplete = useCallback((id: string) => {
    // Capture the completed card's Y — the next card will land exactly here
    const scrollY = cardYRef.current.get(id) ?? 0;

    fadedIdsRef.current.add(id);
    setFadedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // After state update + layout, scroll to where the completed card was
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    }, 60);
  }, []);

  const handleEdit = (item: Dhikr) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setModalVisible(true);
  };

  const bottomPad =
    Platform.OS === "web"
      ? Math.max(insets.bottom + 34, 80)
      : insets.bottom + 16;

  return (
    <View style={[styles.root, { backgroundColor: bgC }]}>
      <ControlBar />

      <View style={[styles.segmentWrapper, { borderBottomColor: borderC }]}>
        <View style={[styles.segment, { backgroundColor: theme === "day" ? "#F5F5F5" : "#252540" }]}>
          {(["evening", "morning"] as const).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.segBtn,
                  isActive && {
                    backgroundColor: bgC,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segBtnText,
                    { color: isActive ? primaryC : mutedC },
                    isActive && styles.segBtnTextActive,
                  ]}
                >
                  {cat === "morning" ? "أذكار الصباح" : "أذكار المساء"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {all.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="book-open" size={48} color={mutedC} />
          <Text style={[styles.emptyTitle, { color: textC }]}>
            لا توجد أذكار
          </Text>
          <Text style={[styles.emptySubtitle, { color: mutedC }]}>
            اضغط + لإضافة ذكر جديد
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!filtered.length}
        >
          {displayList.map((item) => (
            <View
              key={item.id}
              onLayout={(e) => {
                cardYRef.current.set(item.id, e.nativeEvent.layout.y);
              }}
            >
              <DhikrCard
                item={item}
                onEdit={handleEdit}
                onFadeComplete={handleFadeComplete}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryC }]}
        onPress={handleAdd}
        activeOpacity={0.85}
      >
        <Icon name="plus" size={26} color="#fff" />
      </TouchableOpacity>

      <EditModal
        visible={modalVisible}
        editItem={editItem}
        defaultCategory={activeCategory}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  segmentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  segment: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 8,
  },
  segBtnText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  segBtnTextActive: {
    fontWeight: "700" as const,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  emptySubtitle: {
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: 36,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
