import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

export type Category = "morning" | "evening";
export type ThemeMode = "day" | "night";
export type BgColorKey = "white" | "cream" | "mint";

export interface Dhikr {
  id: string;
  text: string;
  maxCount: number;
  currentCount: number;
  category: Category;
}

export interface AppSettings {
  theme: ThemeMode;
  bgColor: BgColorKey;
  fontSize: number;
}

interface AppContextValue {
  adhkar: Dhikr[];
  settings: AppSettings;
  activeCategory: Category;
  isPlayingAll: boolean;
  setActiveCategory: (cat: Category) => void;
  decrementCount: (id: string) => void;
  resetCategory: (category: Category) => void;
  addDhikr: (text: string, count: number, category: Category) => void;
  editDhikr: (id: string, text: string, count: number) => void;
  deleteDhikr: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  speakDhikr: (text: string) => void;
  speakAll: () => void;
  stopSpeaking: () => void;
}

const ADHKAR_KEY = "@adhkar_v1";
const SETTINGS_KEY = "@settings_v1";

const DEFAULT_MORNING: Dhikr[] = [
  {
    id: "m1",
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m2",
    text: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m3",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m4",
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m5",
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m6",
    text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m7",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    maxCount: 100,
    currentCount: 100,
    category: "morning",
  },
  {
    id: "m8",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    maxCount: 10,
    currentCount: 10,
    category: "morning",
  },
  {
    id: "m9",
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    maxCount: 10,
    currentCount: 10,
    category: "morning",
  },
  {
    id: "m10",
    text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ۝ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
];

const DEFAULT_EVENING: Dhikr[] = [
  {
    id: "e1",
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e2",
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e3",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e4",
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e5",
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e6",
    text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e7",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    maxCount: 100,
    currentCount: 100,
    category: "evening",
  },
  {
    id: "e8",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    maxCount: 10,
    currentCount: 10,
    category: "evening",
  },
  {
    id: "e9",
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    maxCount: 10,
    currentCount: 10,
    category: "evening",
  },
  {
    id: "e10",
    text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ۝ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: "day",
  bgColor: "white",
  fontSize: 18,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [adhkar, setAdhkar] = useState<Dhikr[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeCategory, setActiveCategory] = useState<Category>("morning");
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const speakAllRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedAdhkar, storedSettings] = await Promise.all([
          AsyncStorage.getItem(ADHKAR_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);
        if (storedAdhkar) {
          setAdhkar(JSON.parse(storedAdhkar));
        } else {
          const defaults = [...DEFAULT_MORNING, ...DEFAULT_EVENING];
          setAdhkar(defaults);
          await AsyncStorage.setItem(ADHKAR_KEY, JSON.stringify(defaults));
        }
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch {
        setAdhkar([...DEFAULT_MORNING, ...DEFAULT_EVENING]);
      }
    })();
  }, []);

  const saveAdhkar = useCallback(async (list: Dhikr[]) => {
    try {
      await AsyncStorage.setItem(ADHKAR_KEY, JSON.stringify(list));
    } catch {}
  }, []);

  const saveSettings = useCallback(async (s: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {}
  }, []);

  const decrementCount = useCallback(
    (id: string) => {
      setAdhkar((prev) => {
        const next = prev.map((d) => {
          if (d.id === id && d.currentCount > 0) {
            return { ...d, currentCount: d.currentCount - 1 };
          }
          return d;
        });
        saveAdhkar(next);
        return next;
      });
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [saveAdhkar]
  );

  const resetCategory = useCallback(
    (category: Category) => {
      setAdhkar((prev) => {
        const next = prev.map((d) => {
          if (d.category === category) {
            return { ...d, currentCount: d.maxCount };
          }
          return d;
        });
        saveAdhkar(next);
        return next;
      });
    },
    [saveAdhkar]
  );

  const addDhikr = useCallback(
    (text: string, count: number, category: Category) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newDhikr: Dhikr = {
        id,
        text,
        maxCount: count,
        currentCount: count,
        category,
      };
      setAdhkar((prev) => {
        const next = [...prev, newDhikr];
        saveAdhkar(next);
        return next;
      });
    },
    [saveAdhkar]
  );

  const editDhikr = useCallback(
    (id: string, text: string, count: number) => {
      setAdhkar((prev) => {
        const next = prev.map((d) => {
          if (d.id === id) {
            return { ...d, text, maxCount: count, currentCount: count };
          }
          return d;
        });
        saveAdhkar(next);
        return next;
      });
    },
    [saveAdhkar]
  );

  const deleteDhikr = useCallback(
    (id: string) => {
      setAdhkar((prev) => {
        const next = prev.filter((d) => d.id !== id);
        saveAdhkar(next);
        return next;
      });
    },
    [saveAdhkar]
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        saveSettings(next);
        return next;
      });
    },
    [saveSettings]
  );

  const speakDhikr = useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "ar" });
  }, []);

  const speakAll = useCallback(() => {
    const list = adhkar.filter((d) => d.category === activeCategory);
    if (list.length === 0) return;
    Speech.stop();
    speakAllRef.current = true;
    setIsPlayingAll(true);
    let index = 0;
    const speakNext = () => {
      if (!speakAllRef.current) {
        setIsPlayingAll(false);
        return;
      }
      if (index < list.length) {
        const dhikr = list[index];
        index++;
        const textToSpeak =
          dhikr.maxCount > 1
            ? Array(Math.min(dhikr.maxCount, 3)).fill(dhikr.text).join("، ")
            : dhikr.text;
        Speech.speak(textToSpeak, {
          language: "ar",
          onDone: speakNext,
          onError: speakNext,
        });
      } else {
        speakAllRef.current = false;
        setIsPlayingAll(false);
      }
    };
    speakNext();
  }, [adhkar, activeCategory]);

  const stopSpeaking = useCallback(() => {
    speakAllRef.current = false;
    setIsPlayingAll(false);
    Speech.stop();
  }, []);

  return (
    <AppContext.Provider
      value={{
        adhkar,
        settings,
        activeCategory,
        isPlayingAll,
        setActiveCategory,
        decrementCount,
        resetCategory,
        addDhikr,
        editDhikr,
        deleteDhikr,
        updateSettings,
        speakDhikr,
        speakAll,
        stopSpeaking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

export const BG_COLORS: Record<string, Record<BgColorKey, string>> = {
  day: {
    white: "#FFFFFF",
    cream: "#FEF9EF",
    mint: "#F0F9F0",
  },
  night: {
    white: "#1A1A2E",
    cream: "#1E1A10",
    mint: "#0F1F0F",
  },
};

export const TEXT_COLORS: Record<string, string> = {
  day: "#1A1A1A",
  night: "#F0EFE8",
};

export const CARD_COLORS: Record<string, Record<BgColorKey, string>> = {
  day: {
    white: "#F8F8F8",
    cream: "#FBF3E0",
    mint: "#E8F5E8",
  },
  night: {
    white: "#252540",
    cream: "#2A2418",
    mint: "#162816",
  },
};
