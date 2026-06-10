import React from "react";
import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Rect,
} from "react-native-svg";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export type IconName =
  | "moon-filled"
  | "moon"
  | "sun"
  | "headphones"
  | "pause"
  | "refresh-cw"
  | "volume-2"
  | "mic"
  | "square"
  | "x-circle"
  | "edit-2"
  | "check"
  | "check-circle"
  | "x"
  | "trash-2"
  | "plus"
  | "book-open"
  | "speaker"
  | "settings"
  | "chevron-up"
  | "chevron-down"
  | "calendar"
  | "share-2"
  | "play"
  | "volume-x";

export function Icon({ name, size = 24, color = "#000" }: IconProps) {
  const s = { stroke: color, strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

  switch (name) {
    case "moon-filled":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path fill={color} stroke="none" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </Svg>
      );

    case "moon":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path {...s} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </Svg>
      );

    case "sun":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle {...s} cx="12" cy="12" r="5" />
          <Line {...s} x1="12" y1="1" x2="12" y2="3" />
          <Line {...s} x1="12" y1="21" x2="12" y2="23" />
          <Line {...s} x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <Line {...s} x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <Line {...s} x1="1" y1="12" x2="3" y2="12" />
          <Line {...s} x1="21" y1="12" x2="23" y2="12" />
          <Line {...s} x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <Line {...s} x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </Svg>
      );

    case "headphones":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path {...s} d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <Path {...s} d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
          <Path {...s} d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </Svg>
      );

    case "pause":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect {...s} x="6" y="4" width="4" height="16" fill={color} stroke="none" />
          <Rect {...s} x="14" y="4" width="4" height="16" fill={color} stroke="none" />
        </Svg>
      );

    case "refresh-cw":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline {...s} points="23 4 23 10 17 10" />
          <Polyline {...s} points="1 20 1 14 7 14" />
          <Path {...s} d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </Svg>
      );

    case "volume-2":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon {...s} points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" fill={color} />
          <Path {...s} d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </Svg>
      );

    case "mic":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect {...s} x="9" y="2" width="6" height="11" rx="3" />
          <Path {...s} d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <Line {...s} x1="12" y1="19" x2="12" y2="23" />
          <Line {...s} x1="8" y1="23" x2="16" y2="23" />
        </Svg>
      );

    case "square":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill={color} />
        </Svg>
      );

    case "x-circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle {...s} cx="12" cy="12" r="10" />
          <Line {...s} x1="15" y1="9" x2="9" y2="15" />
          <Line {...s} x1="9" y1="9" x2="15" y2="15" />
        </Svg>
      );

    case "edit-2":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path {...s} d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </Svg>
      );

    case "check":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline {...s} points="20 6 9 17 4 12" strokeWidth="2.5" />
        </Svg>
      );

    case "check-circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path {...s} d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <Polyline {...s} points="22 4 12 14.01 9 11.01" />
        </Svg>
      );

    case "x":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line {...s} x1="18" y1="6" x2="6" y2="18" strokeWidth="2.5" />
          <Line {...s} x1="6" y1="6" x2="18" y2="18" strokeWidth="2.5" />
        </Svg>
      );

    case "trash-2":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline {...s} points="3 6 5 6 21 6" />
          <Path {...s} d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <Path {...s} d="M10 11v6M14 11v6" />
          <Path {...s} d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </Svg>
      );

    case "plus":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line {...s} x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" />
          <Line {...s} x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" />
        </Svg>
      );

    case "book-open":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path {...s} d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <Path {...s} d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </Svg>
      );

    case "speaker":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
          <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
        </Svg>
      );

    case "settings":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle {...s} cx="12" cy="12" r="3" />
          <Path {...s} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
      );

    case "chevron-up":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline {...s} points="18 15 12 9 6 15" />
        </Svg>
      );

    case "chevron-down":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline {...s} points="6 9 12 15 18 9" />
        </Svg>
      );

    case "calendar":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect {...s} x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Line {...s} x1="16" y1="2" x2="16" y2="6" />
          <Line {...s} x1="8" y1="2" x2="8" y2="6" />
          <Line {...s} x1="3" y1="10" x2="21" y2="10" />
        </Svg>
      );

    case "share-2":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle {...s} cx="18" cy="5" r="3" />
          <Circle {...s} cx="6" cy="12" r="3" />
          <Circle {...s} cx="18" cy="19" r="3" />
          <Line {...s} x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <Line {...s} x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </Svg>
      );

    case "play":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 3l14 9-14 9V3z" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case "volume-x":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
          <Line {...s} x1="23" y1="9" x2="17" y2="15" />
          <Line {...s} x1="17" y1="9" x2="23" y2="15" />
        </Svg>
      );

    default:
      return null;
  }
}

function Polygon({ points, ...props }: { points: string } & React.ComponentProps<typeof Path>) {
  const pts = points.split(" ").map(p => p.split(",").map(Number));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
  return <Path {...props} d={d} />;
}
