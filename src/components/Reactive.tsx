import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion"
import { cn } from "@/lib/utils"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
    restDelta: 0.001,
  })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500"
    />
  )
}

export function CursorSpotlight({
  className,
  size = 520,
}: {
  className?: string
  size?: number
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(-1000)
  const my = useMotionValue(-1000)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (reduced) return
    const el = ref.current?.parentElement
    if (!el) return
    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      mx.set(e.clientX - rect.left)
      my.set(e.clientY - rect.top)
      setActive(true)
    }
    function onLeave() {
      setActive(false)
    }
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [mx, my, reduced])

  const background = useMotionTemplate`radial-gradient(${size}px circle at ${mx}px ${my}px, rgba(139, 92, 246, 0.18), rgba(14, 165, 233, 0.10) 40%, transparent 70%)`

  if (reduced) return null
  return (
    <motion.div
      ref={ref}
      aria-hidden
      style={{ background }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 transition-opacity",
        className,
      )}
    />
  )
}

export function AuroraBackdrop({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-20 overflow-hidden",
        className,
      )}
    >
      <motion.div
        className="absolute -top-40 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.55), transparent 60%)",
        }}
        animate={
          reduced
            ? undefined
            : { x: [0, 80, -20, 0], y: [0, 40, 80, 0] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 right-0 h-[360px] w-[360px] rounded-full blur-3xl opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.55), transparent 60%)",
        }}
        animate={
          reduced
            ? undefined
            : { x: [0, -60, 20, 0], y: [0, 60, -20, 0] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.45), transparent 60%)",
        }}
        animate={
          reduced
            ? undefined
            : { x: [0, 40, -40, 0], y: [0, -40, 20, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

const MAGNET_SPRING = { stiffness: 220, damping: 18, mass: 0.5 }

export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, MAGNET_SPRING)
  const sy = useSpring(y, MAGNET_SPRING)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const relX = e.clientX - rect.left - rect.width / 2
    const relY = e.clientY - rect.top - rect.height / 2
    x.set(relX * strength)
    y.set(relY * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  )
}

export function GradientText({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-violet-500 via-sky-400 to-fuchsia-500 bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_6s_linear_infinite]",
        className,
      )}
    >
      {children}
    </span>
  )
}
