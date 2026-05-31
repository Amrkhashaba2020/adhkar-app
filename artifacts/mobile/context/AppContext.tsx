import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
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
  recordings: Record<string, string>;
  speakingId: string | null;
  setActiveCategory: (cat: Category) => void;
  decrementCount: (id: string) => void;
  resetCategory: (category: Category) => void;
  addDhikr: (text: string, count: number, category: Category) => void;
  editDhikr: (id: string, text: string, count: number) => void;
  deleteDhikr: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  speakAll: () => void;
  stopSpeaking: () => void;
  speakDhikr: (id: string, text: string) => void;
  stopDhikrSpeech: () => void;
  saveRecording: (id: string, uri: string) => void;
  deleteRecording: (id: string) => void;
}

const ADHKAR_KEY = "@adhkar_v2";
const SETTINGS_KEY = "@settings_v1";
const RECORDINGS_KEY = "@recordings_v1";

const DEFAULT_MORNING: Dhikr[] = [
  {
    id: "m1",
    text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m2",
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m3",
    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m4",
    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m5",
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m6",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m7",
    text: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m8",
    text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    maxCount: 4,
    currentCount: 4,
    category: "morning",
  },
  {
    id: "m9",
    text: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m10",
    text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    maxCount: 7,
    currentCount: 7,
    category: "morning",
  },
  {
    id: "m11",
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m12",
    text: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m13",
    text: "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m14",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m15",
    text: "أَعُوذُ بِوَجْهِ اللَّهِ الْعَظِيمِ الَّذِي لَا شَيْءَ أَعْظَمُ مِنْهُ وَبِكَلِمَاتِ اللَّهِ التَّامَّاتِ الَّتِي لَا يُجَاوِزُهُنَّ بَرٌّ وَلَا فَاجِرٌ وَبِأَسْمَاءِ اللَّهِ الْحُسْنَى كُلِّهَا مَا عَلِمْتُ مِنْهَا وَمَا لَمْ أَعْلَمْ مِنْ شَرِّ مَا خَلَقَ وَذَرَأَ وَبَرَأَ وَمِنْ شَرِّ كُلِّ ذِي شَرٍّ لَا أُطِيقُ ذِكْرَهُ وَمِنْ شَرِّ كُلِّ دَابَّةٍ أَنْتَ آخِذٌ بِنَاصِيَتِهَا إِنَّ رَبِّي عَلَى صِرَاطٍ مُسْتَقِيمٍ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m16",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ عَلَيْكَ تَوَكَّلْتُ وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ مَا شَاءَ اللَّهُ كَانَ وَمَا لَمْ يَشَأْ لَمْ يَكُنْ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ أَعْلَمُ أَنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ وَأَنَّ اللَّهَ قَدْ أَحَاطَ بِكُلِّ شَيْءٍ عِلْمًا اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشَرَكِهِ وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m17",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ رَحْمَةً مِنْ عِنْدِكَ تَهْدِي بِهَا قَلْبِي وَتَجْمَعُ بِهَا أَمْرِي وَتَلُمُّ بِهَا شَعَثِي وَتُصْلِحُ بِهَا غَائِبِي وَتَرْفَعُ بِهَا شَاهِدِي وَتُزَكِّي بِهَا عَمَلِي وَتُلْهِمُنِي بِهَا رُشْدِي وَتَرُدُّ بِهَا أُلْفَتِي وَتَعْصِمُنِي بِهَا مِنْ كُلِّ سُوءٍ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m18",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ الَّتِي لَا يُجَاوِزُهُنَّ بَرٌّ وَلَا فَاجِرٌ مِنْ شَرِّ مَا خَلَقَ وَذَرَأَ وَبَرَأَ وَمِنْ شَرِّ مَا يَنْزِلُ مِنَ السَّمَاءِ وَمِنْ شَرِّ مَا يَعْرُجُ فِيهَا وَمِنْ شَرِّ مَا ذَرَأَ فِي الْأَرْضِ وَمِنْ شَرِّ مَا يَخْرُجُ مِنْهَا وَمِنْ شَرِّ فِتَنِ اللَّيْلِ وَالنَّهَارِ وَمِنْ شَرِّ كُلِّ طَارِقٍ إِلَّا طَارِقًا يَطْرُقُ بِخَيْرٍ يَا رَحْمَنُ",
    maxCount: 3,
    currentCount: 3,
    category: "morning",
  },
  {
    id: "m19",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ وَالْجُبْنِ وَالْهَرَمِ وَالْبُخْلِ وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m20",
    text: "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي",
    maxCount: 1,
    currentCount: 1,
    category: "morning",
  },
  {
    id: "m21",
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    maxCount: 50,
    currentCount: 50,
    category: "morning",
  },
  {
    id: "m22",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    maxCount: 100,
    currentCount: 100,
    category: "morning",
  },
  {
    id: "m23",
    text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    maxCount: 50,
    currentCount: 50,
    category: "morning",
  },
  {
    id: "m24",
    text: "سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ",
    maxCount: 100,
    currentCount: 100,
    category: "morning",
  },
];

const DEFAULT_EVENING: Dhikr[] = [
  {
    id: "e1",
    text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e2",
    text: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e3",
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e4",
    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e5",
    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e6",
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e7",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e8",
    text: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e9",
    text: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    maxCount: 4,
    currentCount: 4,
    category: "evening",
  },
  {
    id: "e10",
    text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e11",
    text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    maxCount: 7,
    currentCount: 7,
    category: "evening",
  },
  {
    id: "e12",
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e13",
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e14",
    text: "أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e15",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e16",
    text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي لَا إِلَهَ إِلَّا أَنْتَ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ لَا إِلَهَ إِلَّا أَنْتَ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e17",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e18",
    text: "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e19",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e20",
    text: "اللَّهُمَّ إِنَّا نَعُوذُ بِكَ أَنْ نُشْرِكَ بِكَ شَيْئًا نَعْلَمُهُ وَنَسْتَغْفِرُكَ لِمَا لَا نَعْلَمُهُ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e21",
    text: "أَعُوذُ بِوَجْهِ اللَّهِ الْعَظِيمِ الَّذِي لَا شَيْءَ أَعْظَمُ مِنْهُ وَبِكَلِمَاتِ اللَّهِ التَّامَّاتِ الَّتِي لَا يُجَاوِزُهُنَّ بَرٌّ وَلَا فَاجِرٌ وَبِأَسْمَاءِ اللَّهِ الْحُسْنَى كُلِّهَا مَا عَلِمْتُ مِنْهَا وَمَا لَمْ أَعْلَمْ مِنْ شَرِّ مَا خَلَقَ وَذَرَأَ وَبَرَأَ وَمِنْ شَرِّ كُلِّ ذِي شَرٍّ لَا أُطِيقُ ذِكْرَهُ إِنَّ رَبِّي عَلَى صِرَاطٍ مُسْتَقِيمٍ",
    maxCount: 3,
    currentCount: 3,
    category: "evening",
  },
  {
    id: "e22",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيئَةً وَمِيتَةً سَوِيَّةً وَمَرَدًّا غَيْرَ مُخْزٍ وَلَا فَاضِحٍ اللَّهُمَّ لَا تَهْلِكْنَا فَجْأَةً وَلَا تَأْخُذْنَا بَغْتَةً وَلَا تَجْعَلْنَا مِنَ الْغَافِلِينَ",
    maxCount: 1,
    currentCount: 1,
    category: "evening",
  },
  {
    id: "e23",
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    maxCount: 50,
    currentCount: 50,
    category: "evening",
  },
  {
    id: "e24",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    maxCount: 100,
    currentCount: 100,
    category: "evening",
  },
  {
    id: "e25",
    text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    maxCount: 50,
    currentCount: 50,
    category: "evening",
  },
  {
    id: "e26",
    text: "سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ",
    maxCount: 100,
    currentCount: 100,
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
  const [recordings, setRecordings] = useState<Record<string, string>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const speakAllRef = useRef(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedAdhkar, storedSettings, storedRecordings] = await Promise.all([
          AsyncStorage.getItem(ADHKAR_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
          AsyncStorage.getItem(RECORDINGS_KEY),
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
        if (storedRecordings) {
          setRecordings(JSON.parse(storedRecordings));
        }
      } catch {
        setAdhkar([...DEFAULT_MORNING, ...DEFAULT_EVENING]);
      }
    })();
    return () => {
      soundRef.current?.unloadAsync();
    };
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

  const saveRecording = useCallback(async (id: string, uri: string) => {
    setRecordings((prev) => {
      const next = { ...prev, [id]: uri };
      AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const next = { ...prev };
      delete next[id];
      AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const playSound = useCallback(async (uri: string, onDone?: () => void) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            onDone?.();
          }
        }
      );
      soundRef.current = sound;
    } catch {
      onDone?.();
    }
  }, []);

  const speakAll = useCallback(() => {
    const list = adhkar.filter(
      (d) => d.category === activeCategory && recordings[d.id]
    );
    if (list.length === 0) return;
    speakAllRef.current = true;
    setIsPlayingAll(true);
    let itemIndex = 0;
    let repeatsDone = 0;

    const playNext = () => {
      if (!speakAllRef.current || itemIndex >= list.length) {
        speakAllRef.current = false;
        setIsPlayingAll(false);
        return;
      }
      const dhikr = list[itemIndex];
      playSound(recordings[dhikr.id], () => {
        if (!speakAllRef.current) {
          setIsPlayingAll(false);
          return;
        }
        // Decrement after each play
        setAdhkar((prev) => {
          const next = prev.map((d) => {
            if (d.id === dhikr.id && d.currentCount > 0) {
              return { ...d, currentCount: d.currentCount - 1 };
            }
            return d;
          });
          AsyncStorage.setItem(ADHKAR_KEY, JSON.stringify(next));
          return next;
        });
        repeatsDone++;
        if (repeatsDone >= dhikr.maxCount) {
          repeatsDone = 0;
          itemIndex++;
        }
        playNext();
      });
    };
    playNext();
  }, [adhkar, activeCategory, recordings, playSound]);

  const stopSpeaking = useCallback(() => {
    speakAllRef.current = false;
    setIsPlayingAll(false);
    soundRef.current?.stopAsync();
  }, []);

  const speakDhikr = useCallback((id: string, text: string) => {
    Speech.stop();
    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    Speech.speak(text, {
      language: "ar-SA",
      rate: Platform.OS === "ios" ? 0.5 : 0.85,
      pitch: 0.9,
      onDone: () => setSpeakingId(null),
      onStopped: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  }, [speakingId]);

  const stopDhikrSpeech = useCallback(() => {
    Speech.stop();
    setSpeakingId(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        adhkar,
        settings,
        activeCategory,
        isPlayingAll,
        recordings,
        speakingId,
        setActiveCategory,
        decrementCount,
        resetCategory,
        addDhikr,
        editDhikr,
        deleteDhikr,
        updateSettings,
        speakAll,
        stopSpeaking,
        speakDhikr,
        stopDhikrSpeech,
        saveRecording,
        deleteRecording,
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
