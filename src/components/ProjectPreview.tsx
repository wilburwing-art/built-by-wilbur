import { motion, useReducedMotion } from "framer-motion"
import type { PreviewKind } from "@/data/projects"
import { cn } from "@/lib/utils"

interface ProjectPreviewProps {
  kind: PreviewKind
  accent: string
  hovered: boolean
  className?: string
}

export function ProjectPreview({ kind, accent, hovered, className }: ProjectPreviewProps) {
  return (
    <div
      className={cn(
        "relative h-44 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-500",
          accent,
          hovered && "opacity-100",
        )}
      />
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative h-full w-full">
        <Scene kind={kind} hovered={hovered} />
      </div>
    </div>
  )
}

function Scene({ kind, hovered }: { kind: PreviewKind; hovered: boolean }) {
  switch (kind) {
    case "agents":
      return <AgentsScene hovered={hovered} />
    case "rag":
      return <RagScene hovered={hovered} />
    case "voice":
      return <VoiceScene hovered={hovered} />
    case "ceramic":
      return <CeramicScene hovered={hovered} />
    case "hut":
      return <HutScene hovered={hovered} />
    case "blueprint":
      return <BlueprintScene hovered={hovered} />
    case "ripple":
      return <RippleScene hovered={hovered} />
    case "campground":
      return <CampgroundScene hovered={hovered} />
    case "canyon":
      return <CanyonScene hovered={hovered} />
    case "rib":
      return <RibScene hovered={hovered} />
    case "bikeshare":
      return <BikeShareScene hovered={hovered} />
  }
}

/** Member vs casual ride length by weekday, the study's core finding. */
function BikeShareScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  const member = [14.8, 12.5, 12.1, 12.4, 12.3, 12.7, 14.6]
  const casual = [30.4, 26.5, 23.2, 22.9, 23.0, 24.5, 28.8]
  const scale = (v: number) => (v / 32) * 78

  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      <line
        x1="30"
        y1="118"
        x2="256"
        y2="118"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1"
        className="text-foreground"
      />
      {member.map((m, i) => {
        const x = 40 + i * 31
        return (
          <g key={i}>
            <motion.rect
              x={x}
              width="11"
              className="fill-foreground"
              fillOpacity={hovered ? 0.75 : 0.55}
              initial={{ height: 0, y: 118 }}
              animate={
                reduced
                  ? { height: scale(casual[i]), y: 118 - scale(casual[i]) }
                  : { height: scale(casual[i]), y: 118 - scale(casual[i]) }
              }
              transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
            />
            <motion.rect
              x={x + 12}
              width="11"
              className="fill-foreground"
              fillOpacity={hovered ? 0.3 : 0.2}
              initial={{ height: 0, y: 118 }}
              animate={{ height: scale(m), y: 118 - scale(m) }}
              transition={{ duration: 0.7, delay: i * 0.06 + 0.1, ease: "easeOut" }}
            />
          </g>
        )
      })}
      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
        <text
          key={i}
          x={40 + i * 31 + 11}
          y="130"
          textAnchor="middle"
          className="fill-foreground font-mono"
          fontSize="7"
          opacity="0.5"
        >
          {d}
        </text>
      ))}
      <text x="30" y="146" className="fill-foreground font-mono" fontSize="7" opacity="0.6">
        CASUAL 26.3m
      </text>
      <text x="160" y="146" className="fill-foreground font-mono" fontSize="7" opacity="0.4">
        MEMBER 13.0m
      </text>
    </svg>
  )
}

function AgentsScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  const speed = reduced ? 0 : hovered ? 1.1 : 2.4
  const nodes = [
    { cx: 70, cy: 70, label: "router" },
    { cx: 210, cy: 50, label: "planner" },
    { cx: 210, cy: 110, label: "feedback" },
  ]
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="agent-edge" x1="0" x2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {nodes.slice(1).map((n, i) => (
        <g key={i}>
          <line
            x1={nodes[0].cx}
            y1={nodes[0].cy}
            x2={n.cx}
            y2={n.cy}
            stroke="url(#agent-edge)"
            strokeWidth="1.5"
            className="text-foreground"
          />
          {speed > 0 && (
            <motion.circle
              r="3"
              className="fill-foreground"
              initial={{ cx: nodes[0].cx, cy: nodes[0].cy, opacity: 0 }}
              animate={{
                cx: [nodes[0].cx, n.cx],
                cy: [nodes[0].cy, n.cy],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: speed,
                repeat: Infinity,
                delay: i * (speed / 2),
                ease: "easeInOut",
              }}
            />
          )}
        </g>
      ))}
      {nodes.map((n) => (
        <g key={n.label}>
          <motion.circle
            cx={n.cx}
            cy={n.cy}
            r="18"
            className="fill-background stroke-foreground"
            strokeWidth="1.25"
            animate={hovered ? { r: [18, 20, 18] } : { r: 18 }}
            transition={{ duration: 1.4, repeat: hovered ? Infinity : 0 }}
          />
          <text
            x={n.cx}
            y={n.cy + 3}
            textAnchor="middle"
            className="fill-foreground font-mono"
            fontSize="8"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function RagScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  const chunks = [0, 1, 2, 3, 4]
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      {chunks.map((i) => (
        <motion.rect
          key={i}
          x={30 + i * 44}
          y={48}
          width={36}
          height={64}
          rx={4}
          className="fill-background stroke-foreground"
          strokeWidth="1"
          animate={
            reduced
              ? {}
              : {
                  y: hovered ? [48, 44, 48] : 48,
                  opacity: [0.6, 1, 0.6],
                }
          }
          transition={{
            duration: hovered ? 1.2 : 2.4,
            delay: i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`l-${i}`}
          x1={36 + i * 44}
          y1={64}
          x2={60 + i * 44}
          y2={64}
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1"
          className="text-foreground"
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`l2-${i}`}
          x1={36 + i * 44}
          y1={80}
          x2={54 + i * 44}
          y2={80}
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1"
          className="text-foreground"
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`l3-${i}`}
          x1={36 + i * 44}
          y1={96}
          x2={58 + i * 44}
          y2={96}
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1"
          className="text-foreground"
        />
      ))}
    </svg>
  )
}

function VoiceScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  const bars = Array.from({ length: 28 }, (_, i) => i)
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      {bars.map((i) => {
        const base = 12 + Math.abs(Math.sin(i * 0.6)) * 36
        return (
          <motion.rect
            key={i}
            x={20 + i * 9}
            y={80 - base / 2}
            width={4}
            height={base}
            rx={2}
            className="fill-foreground"
            animate={
              reduced
                ? {}
                : {
                    height: hovered
                      ? [base, base * 1.4, base * 0.6, base]
                      : [base, base * 1.1, base],
                    y: hovered
                      ? [80 - base / 2, 80 - (base * 1.4) / 2, 80 - (base * 0.6) / 2, 80 - base / 2]
                      : [80 - base / 2, 80 - (base * 1.1) / 2, 80 - base / 2],
                  }
            }
            transition={{
              duration: hovered ? 0.9 : 1.8,
              delay: i * 0.03,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )
      })}
    </svg>
  )
}

function CeramicScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      <motion.g
        animate={reduced ? {} : { rotate: hovered ? 360 : 0 }}
        transition={{ duration: 6, repeat: hovered ? Infinity : 0, ease: "linear" }}
        style={{ transformOrigin: "140px 80px" }}
      >
        <path
          d="M 110 30 C 100 40, 100 55, 118 60 C 125 65, 125 75, 118 80 C 100 85, 100 115, 115 130 L 165 130 C 180 115, 180 85, 162 80 C 155 75, 155 65, 162 60 C 180 55, 180 40, 170 30 Z"
          className="fill-background stroke-foreground"
          strokeWidth="1.5"
        />
        <line x1="115" y1="60" x2="165" y2="60" stroke="currentColor" strokeOpacity="0.4" className="text-foreground" />
        <line x1="110" y1="80" x2="170" y2="80" stroke="currentColor" strokeOpacity="0.4" className="text-foreground" />
        <line x1="115" y1="130" x2="165" y2="130" stroke="currentColor" strokeOpacity="0.4" className="text-foreground" />
      </motion.g>
      {[
        { cx: 118, cy: 60 },
        { cx: 110, cy: 80 },
        { cx: 115, cy: 130 },
        { cx: 170, cy: 30 },
      ].map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r="3"
          className="fill-foreground"
          animate={hovered ? { r: [3, 5, 3] } : { r: 3 }}
          transition={{ duration: 1.2, repeat: hovered ? Infinity : 0, delay: i * 0.2 }}
        />
      ))}
      <g className="text-foreground" stroke="currentColor" fill="none" opacity={hovered ? 0.9 : 0.55}>
        <line x1="188" y1="34" x2="188" y2="46" strokeWidth="1" />
        <line x1="232" y1="34" x2="232" y2="46" strokeWidth="1" />
        <line x1="188" y1="40" x2="232" y2="40" strokeWidth="1" />
      </g>
      <text
        x="196"
        y="30"
        className="fill-foreground font-mono"
        fontSize="7"
        opacity={hovered ? 0.9 : 0.55}
      >
        RIM ⌀ 6.5&quot;
      </text>
    </svg>
  )
}

function HutScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      <path
        d="M 0 118 Q 40 100 75 112 T 140 105 T 210 114 T 280 106"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1"
        className="text-foreground"
      />
      {[
        { x: 55, s: 14 },
        { x: 222, s: 11 },
      ].map((t, i) => (
        <path
          key={i}
          d={`M ${t.x - t.s} 130 L ${t.x} ${130 - t.s * 1.8} L ${t.x + t.s} 130 Z`}
          className="fill-background stroke-foreground"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      ))}
      <path
        d="M 105 130 L 140 55 L 175 130 Z"
        className="fill-background stroke-foreground"
        strokeWidth="1.5"
      />
      <rect
        x="132"
        y="108"
        width="16"
        height="22"
        className="fill-background stroke-foreground"
        strokeWidth="1"
      />
      <motion.circle
        cx="140"
        cy="90"
        r="5"
        className="fill-foreground"
        animate={
          reduced ? {} : hovered ? { opacity: [0.5, 1, 0.5] } : { opacity: [0.55, 0.85, 0.55] }
        }
        transition={{ duration: hovered ? 1 : 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  )
}

function BlueprintScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      <g className="text-foreground" stroke="currentColor" fill="none">
        <motion.rect
          x="50"
          y="30"
          width="180"
          height="100"
          strokeWidth="1.5"
          strokeOpacity="0.9"
          initial={{ pathLength: 0 }}
          animate={reduced ? { pathLength: 1 } : { pathLength: hovered ? 1 : [0, 1, 1] }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <motion.line
          x1="140"
          y1="30"
          x2="140"
          y2="130"
          strokeWidth="1"
          strokeOpacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeInOut" }}
        />
        <motion.line
          x1="50"
          y1="80"
          x2="230"
          y2="80"
          strokeWidth="1"
          strokeOpacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.6, ease: "easeInOut" }}
        />
        {[
          { x: 70, y: 50, w: 50, h: 20 },
          { x: 160, y: 50, w: 50, h: 20 },
          { x: 70, y: 90, w: 50, h: 30 },
          { x: 160, y: 90, w: 50, h: 30 },
        ].map((r, i) => (
          <motion.rect
            key={i}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            strokeWidth="0.75"
            strokeOpacity="0.4"
            animate={hovered ? { strokeOpacity: [0.4, 0.9, 0.4] } : { strokeOpacity: 0.4 }}
            transition={{ duration: 1.2, delay: i * 0.15, repeat: hovered ? Infinity : 0 }}
          />
        ))}
      </g>
      <text x="54" y="26" className="fill-foreground font-mono" fontSize="7" opacity="0.6">
        UNIT A  ·  UNIT B  ·  UNIT C  ·  UNIT D
      </text>
    </svg>
  )
}

function RippleScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  const steams = [
    { x: 126, delay: 0 },
    { x: 140, delay: 0.4 },
    { x: 154, delay: 0.8 },
  ]
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      {[0, 1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          cx="140"
          cy="80"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          className="text-foreground"
          initial={{ r: 10, opacity: 0.8 }}
          animate={
            reduced
              ? {}
              : {
                  r: [10, 90],
                  opacity: [0.8, 0],
                }
          }
          transition={{
            duration: hovered ? 2 : 3.2,
            delay: i * (hovered ? 0.5 : 0.8),
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
      {!reduced &&
        steams.map((s, i) => (
          <motion.path
            key={i}
            d={`M ${s.x} 68 Q ${s.x - 6} 55 ${s.x} 42 Q ${s.x + 6} 30 ${s.x} 18`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.5"
            className="text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0], y: [6, -8] }}
            transition={{
              duration: hovered ? 1.6 : 2.6,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      <circle cx="140" cy="80" r="5" className="fill-foreground" />
      <text x="150" y="112" className="fill-foreground font-mono" fontSize="8" opacity="0.6">
        104°F
      </text>
    </svg>
  )
}

function CampgroundScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  const cols = [40, 90, 140, 190, 240]
  const rows = [38, 58, 78, 98, 118]
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      <rect
        x={cols[0]}
        y={rows[0]}
        width={cols[4] - cols[0]}
        height={rows[4] - rows[0]}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.25"
        className="text-foreground"
      />
      {cols.slice(1, 4).map((x, i) => (
        <line
          key={`c-${i}`}
          x1={x}
          y1={rows[0]}
          x2={x}
          y2={rows[4]}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
          className="text-foreground"
        />
      ))}
      {rows.slice(1, 4).map((y, i) => (
        <line
          key={`r-${i}`}
          x1={cols[0]}
          y1={y}
          x2={cols[4]}
          y2={y}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
          className="text-foreground"
        />
      ))}
      <motion.rect
        x={cols[0]}
        y={rows[2]}
        width={cols[4] - cols[0]}
        height={rows[3] - rows[2]}
        className="fill-foreground"
        animate={
          reduced ? { opacity: 0.12 } : { opacity: hovered ? [0.08, 0.22, 0.08] : 0.1 }
        }
        transition={{ duration: 1.8, repeat: hovered ? Infinity : 0, ease: "easeInOut" }}
      />
      <path
        d="M 246 128 L 258 106 L 270 128 Z"
        className="fill-background stroke-foreground"
        strokeWidth="1.25"
      />
      <line
        x1="258"
        y1="106"
        x2="258"
        y2="128"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1"
        className="text-foreground"
      />
    </svg>
  )
}

function CanyonScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  const leftWall = "M 110 0 L 118 20 L 108 38 L 122 56 L 112 76 L 124 96 L 114 118 L 120 140 L 112 160"
  const rightWall = "M 170 0 L 162 22 L 174 40 L 160 58 L 172 78 L 158 98 L 170 120 L 162 140 L 170 160"
  const dots = [
    { x: 140, y: 40 },
    { x: 138, y: 80 },
    { x: 142, y: 120 },
  ]
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      <path
        d={leftWall}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        className="text-foreground"
      />
      <path
        d={rightWall}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        className="text-foreground"
      />
      <line
        x1="140"
        y1="10"
        x2="140"
        y2="150"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1"
        strokeDasharray="3 4"
        className="text-foreground"
      />
      {dots.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.x}
          cy={d.y}
          r="3.5"
          className="fill-foreground"
          animate={
            reduced
              ? {}
              : hovered
              ? { opacity: [0.5, 1, 0.5], r: [3.5, 5, 3.5] }
              : { opacity: [0.6, 0.9, 0.6] }
          }
          transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  )
}

function RibScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      <motion.path
        d="M 55 92 Q 140 30 225 92 Q 140 70 55 92 Z"
        className="fill-background stroke-foreground"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={reduced ? { pathLength: 1 } : { pathLength: hovered ? 1 : [0, 1, 1] }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      <path
        d="M 70 100 Q 140 118 210 100"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeDasharray="2 3"
        className="text-foreground"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1={70 + i * 28}
          y1="122"
          x2={70 + i * 28}
          y2="130"
          stroke="currentColor"
          strokeOpacity={hovered ? 0.8 : 0.4}
          strokeWidth="1"
          className="text-foreground"
        />
      ))}
      <text x="98" y="145" className="fill-foreground font-mono" fontSize="7" opacity="0.6">
        RIB · 1:1mm
      </text>
    </svg>
  )
}
