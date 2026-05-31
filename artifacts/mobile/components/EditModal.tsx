import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TEXT_COLORS,
  useApp,
  type Category,
  type Dhikr,
} from "@/context/AppContext";
import { Icon } from "@/components/Icon";

interface Props {
  visible: boolean;
  editItem: Dhikr | null;
  defaultCategory: Category;
  onClose: () => void;
}

export function EditModal({ visible, editItem, defaultCategory, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { settings, addDhikr, editDhikr, deleteDhikr } = useApp();
  const { theme } = settings;

  const [text, setText] = useState("");
  const [count, setCount] = useState("1");
  const [category, setCategory] = useState<Category>(defaultCategory);

  const textC = TEXT_COLORS[theme];
  const bgC = theme === "day" ? "#FFFFFF" : "#1A1A2E";
  const inputBg = theme === "day" ? "#F5F5F5" : "#252540";
  const borderC = theme === "day" ? "#E0E0E0" : "#333333";
  const primaryC = theme === "day" ? "#2E7D32" : "#4CAF50";
  const mutedC = theme === "day" ? "#6B7280" : "#9CA3AF";

  useEffect(() => {
    if (visible) {
      if (editItem) {
        setText(editItem.text);
        setCount(String(editItem.maxCount));
        setCategory(editItem.category);
      } else {
        setText("");
        setCount("1");
        setCategory(defaultCategory);
      }
    }
  }, [visible, editItem, defaultCategory]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const num = parseInt(count, 10);
    const validCount = isNaN(num) || num < 1 ? 1 : Math.min(num, 999);
    if (editItem) {
      editDhikr(editItem.id, trimmed, validCount);
    } else {
      addDhikr(trimmed, validCount, category);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.kav}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: bgC,
                paddingBottom: Math.max(insets.bottom + 16, 32),
              },
            ]}
          >
            <View style={[styles.header, { borderBottomColor: borderC }]}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="x" size={22} color={mutedC} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: textC }]}>
                {editItem ? "تعديل الذكر" : "إضافة ذكر جديد"}
              </Text>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: primaryC }]}
              >
                <Text style={styles.saveBtnText}>حفظ</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.label, { color: mutedC }]}>نص الذكر</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBg,
                    color: textC,
                    borderColor: borderC,
                  },
                ]}
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={5}
                textAlign="right"
                textAlignVertical="top"
                placeholder="اكتب الذكر هنا..."
                placeholderTextColor={mutedC}
                autoFocus
              />

              <Text style={[styles.label, { color: mutedC, marginTop: 16 }]}>
                عدد التكرار
              </Text>
              <TextInput
                style={[
                  styles.countInput,
                  {
                    backgroundColor: inputBg,
                    color: textC,
                    borderColor: borderC,
                  },
                ]}
                value={count}
                onChangeText={setCount}
                keyboardType="number-pad"
                textAlign="center"
                maxLength={3}
              />

              {editItem && (
                <TouchableOpacity
                  onPress={() => {
                    deleteDhikr(editItem.id);
                    onClose();
                  }}
                  style={[styles.deleteBtn, { borderColor: "#EF4444" }]}
                >
                  <Icon name="trash-2" size={16} color="#EF4444" />
                  <Text style={[styles.deleteBtnText, { color: "#EF4444" }]}>حذف الذكر</Text>
                </TouchableOpacity>
              )}

              {!editItem && (
                <>
                  <Text style={[styles.label, { color: mutedC, marginTop: 16 }]}>
                    التصنيف
                  </Text>
                  <View style={styles.categoryRow}>
                    {(["morning", "evening"] as Category[]).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.catBtn,
                          {
                            backgroundColor:
                              category === cat ? primaryC : inputBg,
                            borderColor:
                              category === cat ? primaryC : borderC,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.catBtnText,
                            {
                              color: category === cat ? "#fff" : textC,
                            },
                          ]}
                        >
                          {cat === "morning" ? "الصباح" : "المساء"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  kav: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 360,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "600" as const,
    fontSize: 15,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500" as const,
    marginBottom: 8,
    textAlign: "right",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlign: "right",
    writingDirection: "rtl" as const,
    lineHeight: 26,
  },
  countInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 20,
    fontWeight: "700" as const,
    height: 52,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 12,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  catBtnText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
});
