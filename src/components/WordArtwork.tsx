import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { PlanVisualTone } from "@/features/devotionalPlans/planVisuals";

type WordArtworkProps = {
  motif: "seed" | "restoration" | "night" | "identity" | "shield" | "path" | "lamp" | "healing";
  tone: PlanVisualTone;
  width?: number;
  height?: number;
};

const tonePalettes: Record<PlanVisualTone, { a: string; b: string; c: string; line: string }> = {
  gold: { a: "#FFF7E2", b: "#F7E3A5", c: "#F9A825", line: "#8B6508" },
  jade: { a: "#EAF7F0", b: "#C6EAD3", c: "#3E8C5D", line: "#255C3B" },
  navy: { a: "#EEF2FF", b: "#C8D6FF", c: "#1A237E", line: "#0F164E" },
  rose: { a: "#FFF0F2", b: "#F7CAD3", c: "#C45772", line: "#8C2F49" },
  violet: { a: "#F4F1FF", b: "#D9CEFF", c: "#6C5CE7", line: "#4330A7" },
};

export function WordArtwork({ height = 188, motif, tone, width = 300 }: WordArtworkProps) {
  const palette = tonePalettes[tone];

  return (
    <Svg height={height} viewBox="0 0 300 188" width={width}>
      <Defs>
        <LinearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor={palette.a} />
          <Stop offset="0.58" stopColor={palette.b} />
          <Stop offset="1" stopColor="#FFFFFF" />
        </LinearGradient>
        <LinearGradient id="wash" x1="0.2" x2="0.9" y1="0" y2="1">
          <Stop offset="0" stopColor={palette.c} stopOpacity="0.18" />
          <Stop offset="1" stopColor={palette.c} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect fill="url(#bg)" height="188" rx="28" width="300" />
      <Rect fill="url(#wash)" height="188" rx="28" width="300" />
      <Ellipse cx="212" cy="42" fill={palette.c} opacity="0.08" rx="88" ry="58" />
      <Ellipse cx="75" cy="150" fill={palette.c} opacity="0.08" rx="95" ry="60" />
      <Path
        d="M18 136C60 104 87 102 121 115C147 125 171 126 205 112C236 99 256 96 282 104"
        fill="none"
        opacity="0.18"
        stroke={palette.line}
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <Circle cx="56" cy="48" fill={palette.c} opacity="0.12" r="14" />
      <Circle cx="263" cy="136" fill={palette.c} opacity="0.12" r="10" />
      <Circle cx="232" cy="119" fill={palette.c} opacity="0.08" r="4" />
      <Circle cx="92" cy="32" fill={palette.c} opacity="0.08" r="5" />

      <G>
        {motif === "seed" ? <SeedMotif line={palette.line} /> : null}
        {motif === "restoration" ? <RestorationMotif line={palette.line} /> : null}
        {motif === "night" ? <NightMotif line={palette.line} /> : null}
        {motif === "identity" ? <IdentityMotif line={palette.line} /> : null}
        {motif === "shield" ? <ShieldMotif line={palette.line} /> : null}
        {motif === "path" ? <PathMotif line={palette.line} /> : null}
        {motif === "lamp" ? <LampMotif line={palette.line} /> : null}
        {motif === "healing" ? <HealingMotif line={palette.line} /> : null}
      </G>
    </Svg>
  );
}

function SeedMotif({ line }: { line: string }) {
  return (
    <G>
      <Path d="M146 116C146 91 148 78 154 62" fill="none" stroke={line} strokeLinecap="round" strokeWidth="3" />
      <Path d="M154 64C138 62 122 74 122 89C136 91 151 82 154 64Z" fill="none" stroke={line} strokeLinejoin="round" strokeWidth="3" />
      <Path d="M155 74C171 69 187 77 194 91C180 95 163 91 155 74Z" fill="none" stroke={line} strokeLinejoin="round" strokeWidth="3" />
      <Circle cx="150" cy="119" fill={line} r="4.5" />
    </G>
  );
}

function RestorationMotif({ line }: { line: string }) {
  return (
    <G>
      <Path d="M107 58H193V130H107Z" fill="none" opacity="0.35" stroke={line} strokeDasharray="7 6" strokeWidth="2" />
      <Path d="M120 118C135 105 139 85 151 80C164 74 173 57 184 42" fill="none" stroke={line} strokeLinecap="round" strokeWidth="4" />
      <Path d="M114 74L130 88L148 70L164 92L183 74" fill="none" opacity="0.65" stroke={line} strokeLinecap="round" strokeWidth="2.5" />
    </G>
  );
}

function NightMotif({ line }: { line: string }) {
  return (
    <G>
      <Path d="M166 54C155 50 142 52 133 60C120 72 118 91 129 105C137 115 151 120 165 116C157 112 151 105 148 96C143 80 151 63 166 54Z" fill="none" stroke={line} strokeWidth="4" />
      <Path d="M188 68L191 76L199 79L191 82L188 90L185 82L177 79L185 76Z" fill={line} />
      <Path d="M110 93L112 99L118 101L112 103L110 109L108 103L102 101L108 99Z" fill={line} opacity="0.7" />
    </G>
  );
}

function IdentityMotif({ line }: { line: string }) {
  return (
    <G>
      <Circle cx="150" cy="66" fill="none" stroke={line} strokeWidth="3.5" r="18" />
      <Path d="M116 118C126 98 139 88 150 88C161 88 174 98 184 118" fill="none" stroke={line} strokeLinecap="round" strokeWidth="3.5" />
      <Path d="M136 104H164" opacity="0.4" stroke={line} strokeLinecap="round" strokeWidth="2.5" />
    </G>
  );
}

function ShieldMotif({ line }: { line: string }) {
  return (
    <G>
      <Path d="M150 46L194 61V89C194 114 177 133 150 145C123 133 106 114 106 89V61L150 46Z" fill="none" stroke={line} strokeLinejoin="round" strokeWidth="4" />
      <Path d="M150 65V118" stroke={line} strokeLinecap="round" strokeWidth="4" />
      <Path d="M131 84H169" stroke={line} strokeLinecap="round" strokeWidth="4" />
    </G>
  );
}

function PathMotif({ line }: { line: string }) {
  return (
    <G>
      <Path d="M97 120C123 99 139 92 154 92C171 92 184 101 203 119" fill="none" stroke={line} strokeLinecap="round" strokeWidth="4" />
      <Path d="M150 48V93" fill="none" opacity="0.6" stroke={line} strokeLinecap="round" strokeWidth="2.5" />
      <Circle cx="150" cy="44" fill={line} r="5" />
    </G>
  );
}

function LampMotif({ line }: { line: string }) {
  return (
    <G>
      <Path d="M150 44C160 52 164 61 164 70C164 84 156 96 150 103C144 96 136 84 136 70C136 61 140 52 150 44Z" fill="none" stroke={line} strokeLinejoin="round" strokeWidth="4" />
      <Path d="M150 102V129" fill="none" stroke={line} strokeLinecap="round" strokeWidth="4" />
      <Path d="M126 131H174" fill="none" stroke={line} strokeLinecap="round" strokeWidth="3.5" />
      <Path d="M118 64C126 55 136 49 150 46C164 49 174 55 182 64" fill="none" opacity="0.35" stroke={line} strokeLinecap="round" strokeWidth="2.5" />
    </G>
  );
}

function HealingMotif({ line }: { line: string }) {
  return (
    <G>
      <Path d="M110 84C110 63 127 48 147 48C160 48 171 55 177 66C183 55 194 48 207 48C227 48 244 63 244 84C244 110 224 126 177 148C130 126 110 110 110 84Z" fill="none" stroke={line} strokeLinejoin="round" strokeWidth="3.5" />
      <Path d="M174 70L184 83L196 74" fill="none" stroke={line} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </G>
  );
}
