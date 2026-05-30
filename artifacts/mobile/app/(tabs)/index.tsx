import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ControlBar } from "@/components/ControlBar";
import { DhikrCard } from "@/components/DhikrCard";
import { EditModal } from "@/components/EditModal";
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

  const { theme, bgColor } = settings;
  const bgC = BG_COLORS[theme][bgColor];
  const textC = TEXT_COLORS[theme];
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const mutedC = theme === "day" ? "#6B7280" : "#9CA3AF";
  const borderC = theme === "day" ? "#E0E0E0" : "#333333";

  const all = adhkar.filter((d) => d.category === activeCategory);
  const filtered = all.filter((d) => d.currentCount > 0);
  const completedCount = all.filter((d) => d.currentCount === 0).length;
  // Use all items (not just filtered) so fade-out animation plays before removal
  const totalCount = all.length;

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

        {totalCount > 0 && (
          <Text style={[styles.progress, { color: mutedC }]}>
            {completedCount}/{totalCount}
          </Text>
        )}
      </View>

      {all.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="book-open" size={48} color={mutedC} />
          <Text style={[styles.emptyTitle, { color: textC }]}>
            لا توجد أذكار
          </Text>
          <Text style={[styles.emptySubtitle, { color: mutedC }]}>
            اضغط + لإضافة ذكر جديد
          </Text>
        </View>
      ) : (
        <FlatList
          data={all}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DhikrCard item={item} onEdit={handleEdit} />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: bottomPad },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!filtered.length}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryC }]}
        onPress={handleAdd}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={26} color="#fff" />
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
    paddingTop: 12,
    paddingBottom: 8,
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
  progress: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
  },
  list: {
    padding: 16,
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
