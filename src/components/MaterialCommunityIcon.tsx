import { ComponentProps } from "react";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

// This compatibility component deliberately keeps the existing call sites while
// rendering a small, local SVG set. It must never register a native icon font:
// iPhone XS crash reports implicated FontServices while registering the previous
// icon asset during application startup.
const glyphMap: Record<string, number> = {};

type IconProps = Omit<ComponentProps<typeof Svg>, "color" | "height" | "width"> & {
  color?: string;
  name: string;
  size?: number;
};

const strokeProps = {
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.9,
};

export function MaterialCommunityIcons({ color = "currentColor", name, size = 24, ...props }: IconProps) {
  return (
    <Svg {...props} color={color} height={size} viewBox="0 0 24 24" width={size}>
      <IconArtwork name={name} />
    </Svg>
  );
}

function IconArtwork({ name }: { name: string }) {
  if (name.includes("shield")) {
    return <><Path {...strokeProps} d="M12 2.5 20 5.7v5.5c0 4.8-3.2 8.8-8 10.8-4.8-2-8-6-8-10.8V5.7L12 2.5Z" stroke="currentColor" />{name.includes("cross") ? <><Line {...strokeProps} stroke="currentColor" x1="12" x2="12" y1="7" y2="16.5" /><Line {...strokeProps} stroke="currentColor" x1="8.2" x2="15.8" y1="10.8" y2="10.8" /></> : name.includes("check") ? <Polyline {...strokeProps} points="8,12 10.7,14.7 16.7,8.7" stroke="currentColor" /> : name.includes("lock") || name.includes("key") ? <Lock /> : null}</>;
  }
  if (name.includes("account") || name.includes("group")) return <Account group={name.includes("group")} />;
  if (name.includes("book")) return <><Path {...strokeProps} d="M4 5.5c2.8-1.3 5.4-.9 8 1v12c-2.6-1.9-5.2-2.3-8-1V5.5Z" stroke="currentColor" /><Path {...strokeProps} d="M20 5.5c-2.8-1.3-5.4-.9-8 1v12c2.6-1.9 5.2-2.3 8-1V5.5Z" stroke="currentColor" /></>;
  if (name === "check" || name === "check-circle") return <><Circle {...strokeProps} cx="12" cy="12" r="8.5" stroke="currentColor" /><Polyline {...strokeProps} points="8.2,12.1 10.7,14.6 16.3,9" stroke="currentColor" /></>;
  if (name.includes("chevron")) return <Polyline {...strokeProps} points={name.includes("up") ? "6,15 12,9 18,15" : name.includes("down") ? "6,9 12,15 18,9" : "9,6 15,12 9,18"} stroke="currentColor" />;
  if (name.includes("arrow")) return <><Line {...strokeProps} stroke="currentColor" x1={name.includes("left") ? "19" : "5"} x2={name.includes("left") ? "5" : "19"} y1="12" y2="12" /><Polyline {...strokeProps} points={name.includes("left") ? "11,6 5,12 11,18" : "13,6 19,12 13,18"} stroke="currentColor" /></>;
  if (name === "close") return <><Line {...strokeProps} stroke="currentColor" x1="6" x2="18" y1="6" y2="18" /><Line {...strokeProps} stroke="currentColor" x1="18" x2="6" y1="6" y2="18" /></>;
  if (name.includes("heart")) return <Path {...strokeProps} d="M12 20s-7-4.3-7-10.1C5 7.3 6.7 6 8.7 6c1.5 0 2.7.8 3.3 2 0 0 1.3-2 3.3-2 2 0 3.7 1.3 3.7 3.9C19 15.7 12 20 12 20Z" stroke="currentColor" />;
  if (name.includes("lock") || name.includes("database")) return <Lock />;
  if (name.includes("camera")) return <><Rect {...strokeProps} height="11" rx="2" stroke="currentColor" width="17" x="3.5" y="7.5" /><Path {...strokeProps} d="M8 7.5 9.3 5.5h5.4L16 7.5" stroke="currentColor" /><Circle {...strokeProps} cx="12" cy="13" r="3" stroke="currentColor" /></>;
  if (name.includes("cellphone")) return <><Rect {...strokeProps} height="18" rx="2.2" stroke="currentColor" width="10" x="7" y="3" /><Line {...strokeProps} stroke="currentColor" x1="10.2" x2="13.8" y1="18" y2="18" /></>;
  if (name.includes("email") || name.includes("message") || name.includes("send")) return <><Rect {...strokeProps} height="13" rx="2" stroke="currentColor" width="18" x="3" y="5.5" /><Polyline {...strokeProps} points="4,7 12,13 20,7" stroke="currentColor" /></>;
  if (name.includes("clock") || name.includes("timer")) return <><Circle {...strokeProps} cx="12" cy="12" r="8" stroke="currentColor" /><Line {...strokeProps} stroke="currentColor" x1="12" x2="12" y1="8" y2="12" /><Line {...strokeProps} stroke="currentColor" x1="12" x2="15" y1="12" y2="14" /></>;
  if (name.includes("fire")) return <Path {...strokeProps} d="M12.5 3.5c1 4-2.5 5.1-1.2 8.1.5 1.2 1.6 1.7 2.5 1.8-.2-2.1 1.4-3.4 1.7-5.4 2.9 2.2 4 5 3.1 8-1 3.2-3.7 5-6.6 5-3.7 0-6.5-2.7-6.5-6.2 0-3.6 2.6-6.1 5-8.5.5-.5 1.4-1.6 2-2.8Z" stroke="currentColor" />;
  if (name.includes("dots")) return <><Circle cx="6" cy="12" fill="currentColor" r="1.3" /><Circle cx="12" cy="12" fill="currentColor" r="1.3" /><Circle cx="18" cy="12" fill="currentColor" r="1.3" /></>;
  if (name.includes("circle")) return <Circle {...strokeProps} cx="12" cy="12" r="8" stroke="currentColor" />;
  if (name.includes("image")) return <><Rect {...strokeProps} height="15" rx="2" stroke="currentColor" width="18" x="3" y="4.5" /><Circle cx="9" cy="9" fill="currentColor" r="1.3" /><Path {...strokeProps} d="m5 17 4.6-4.6 3 3L15 13l4 4" stroke="currentColor" /></>;
  if (name.includes("refresh") || name.includes("restart")) return <><Path {...strokeProps} d="M19 9a7.5 7.5 0 1 0 1 5" stroke="currentColor" /><Polyline {...strokeProps} points="19,4 19,9 14,9" stroke="currentColor" /></>;
  return <><Path {...strokeProps} d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" stroke="currentColor" /><Circle cx="12" cy="12" fill="currentColor" r="1" /></>;
}

function Account({ group }: { group: boolean }) {
  return <>{group ? <Circle {...strokeProps} cx="7.5" cy="9" r="3" stroke="currentColor" /> : null}<Circle {...strokeProps} cx={group ? "15.5" : "12"} cy="8" r="3.5" stroke="currentColor" /><Path {...strokeProps} d={group ? "M3 19c.2-3 2.1-4.8 4.8-4.8 1.2 0 2.2.3 3 .9M10.5 20c.3-3.6 2.5-5.7 5-5.7 3.1 0 5.1 2.2 5.4 5.7" : "M5 20c.4-4 3-6 7-6s6.6 2 7 6"} stroke="currentColor" /></>;
}

function Lock() {
  return <><Rect {...strokeProps} height="9" rx="1.8" stroke="currentColor" width="13" x="5.5" y="11" /><Path {...strokeProps} d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" /><Circle cx="12" cy="15.5" fill="currentColor" r="1" /></>;
}

MaterialCommunityIcons.glyphMap = glyphMap;
