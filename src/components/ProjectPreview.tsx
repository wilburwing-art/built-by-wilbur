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
    case "atlas":
      return <AtlasScene hovered={hovered} />
    case "blueprint":
      return <BlueprintScene hovered={hovered} />
    case "ripple":
      return <RippleScene hovered={hovered} />
  }
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
    </svg>
  )
}

function AtlasScene({ hovered }: { hovered: boolean }) {
  const reduced = useReducedMotion()
  const pins = [
    { x: 60, y: 50 },
    { x: 100, y: 80 },
    { x: 140, y: 40 },
    { x: 180, y: 90 },
    { x: 220, y: 60 },
    { x: 80, y: 120 },
    { x: 160, y: 115 },
    { x: 210, y: 125 },
  ]
  return (
    <svg viewBox="0 0 280 160" className="absolute inset-0 h-full w-full">
      {[30, 55, 80, 105, 130].map((y, i) => (
        <path
          key={i}
          d={`M 0 ${y} Q 70 ${y - 10 + (i % 2) * 8} 140 ${y} T 280 ${y}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1"
          className="text-foreground"
        />
      ))}
      {pins.map((p, i) => (
        <motion.g
          key={i}
          animate={
            reduced
              ? {}
              : {
                  y: hovered ? [0, -3, 0] : 0,
                }
          }
          transition={{ duration: 1.6, delay: i * 0.1, repeat: hovered ? Infinity : 0 }}
        >
          <circle cx={p.x} cy={p.y} r="4" className="fill-foreground" />
          <circle
            cx={p.x}
            cy={p.y}
            r="8"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.3"
            className="text-foreground"
          />
        </motion.g>
      ))}
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
      <circle cx="140" cy="80" r="5" className="fill-foreground" />
    </svg>
  )
}
