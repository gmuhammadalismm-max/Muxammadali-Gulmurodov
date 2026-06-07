import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Sliders, Zap, Shield, HelpCircle, Activity, Play, Eye, EyeOff, Cpu, X } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  energy: number;
  targetX?: number;
  targetY?: number;
}

interface PulsePacket {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
}

export default function TechShowpiece() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // HUD state controllers
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<"cyber" | "vortex" | "matrix" | "quantum">("cyber");
  const [particleCount, setParticleCount] = useState(120);
  const [connectDistance, setConnectDistance] = useState(130);
  const [overloadMode, setOverloadMode] = useState(false);
  const [mouseGravity, setMouseGravity] = useState(true);
  const [hudStats, setHudStats] = useState({ fps: 60, packets: 0, bandwidth: "78.4 MB/s", temperature: "42°C" });
  const [visible, setVisible] = useState(true);

  // Keep references to values used in animation frame to avoid closure stale state
  const stateRef = useRef({
    activePreset,
    particleCount,
    connectDistance,
    overloadMode,
    mouseGravity,
    particles: [] as Particle[],
    packets: [] as PulsePacket[],
    mouse: { x: -1000, y: -1000, targetX: -1000, targetY: -1000, isDown: false }
  });

  // Sync state values to ref
  useEffect(() => {
    stateRef.current.activePreset = activePreset;
    stateRef.current.particleCount = particleCount;
    stateRef.current.connectDistance = connectDistance;
    stateRef.current.overloadMode = overloadMode;
    stateRef.current.mouseGravity = mouseGravity;
  }, [activePreset, particleCount, connectDistance, overloadMode, mouseGravity]);

  // Adjust particles upon slider change
  useEffect(() => {
    const currentParticles = stateRef.current.particles;
    const count = particleCount;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (currentParticles.length < count) {
      // Add extra
      for (let i = currentParticles.length; i < count; i++) {
        const isSpiky = Math.random() > 0.85;
        currentParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (isSpiky ? 2.5 : 1.2),
          vy: (Math.random() - 0.5) * (isSpiky ? 2.5 : 1.2),
          radius: isSpiky ? 2.5 : 1.5,
          baseRadius: isSpiky ? 2.5 : 1.5,
          color: isSpiky ? "#06b6d4" : "#cbd5e1",
          glowColor: isSpiky ? "rgba(6, 182, 212, 0.8)" : "rgba(203, 213, 225, 0.4)",
          energy: Math.random() * 50
        });
      }
    } else if (currentParticles.length > count) {
      stateRef.current.particles = currentParticles.slice(0, count);
    }
  }, [particleCount]);

  // Handle Preset Changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const particles = stateRef.current.particles;

    if (activePreset === "vortex") {
      // Set swirling speeds around center
      particles.forEach(p => {
        const dx = p.x - canvas.width / 2;
        const dy = p.y - canvas.height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        p.vx = (-dy / dist) * 1.5;
        p.vy = (dx / dist) * 1.5;
      });
    } else if (activePreset === "matrix") {
      // Move strictly downwards
      particles.forEach(p => {
        p.vx = 0;
        p.vy = Math.random() * 2.5 + 1.2;
        p.color = "#10b981"; // Emerald green
        p.glowColor = "rgba(16, 185, 129, 0.8)";
      });
    } else if (activePreset === "cyber") {
      particles.forEach(p => {
        const isSpiky = Math.random() > 0.8;
        p.vx = (Math.random() - 0.5) * 1.2;
        p.vy = (Math.random() - 0.5) * 1.2;
        p.color = isSpiky ? "#06b6d4" : "#94a3b8";
        p.glowColor = isSpiky ? "rgba(6, 182, 212, 0.8)" : "rgba(148, 163, 184, 0.4)";
      });
    } else if (activePreset === "quantum") {
      particles.forEach(p => {
        // High frequency micro-vibrations
        p.vx = (Math.random() - 0.5) * 4.0;
        p.vy = (Math.random() - 0.5) * 4.0;
        p.color = "#ec4899"; // Cyber pink
        p.glowColor = "rgba(236, 72, 153, 0.7)";
      });
    }
  }, [activePreset]);

  // Core Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animFrame: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = 0;

    const resizeCanvas = () => {
      const parent = containerRef.current;
      if (parent && canvas) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Initialize particles if empty
        const count = stateRef.current.particleCount;
        if (stateRef.current.particles.length === 0) {
          const arr: Particle[] = [];
          for (let i = 0; i < count; i++) {
            const isSpiky = Math.random() > 0.8;
            arr.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              vx: (Math.random() - 0.5) * (isSpiky ? 2.5 : 1.2),
              vy: (Math.random() - 0.5) * (isSpiky ? 2.5 : 1.2),
              radius: isSpiky ? 2.5 : 1.5,
              baseRadius: isSpiky ? 2.5 : 1.5,
              color: isSpiky ? "#06b6d4" : "#94a3b8",
              glowColor: isSpiky ? "rgba(6, 182, 212, 0.8)" : "rgba(148, 163, 184, 0.3)",
              energy: Math.random() * 50
            });
          }
          stateRef.current.particles = arr;
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse over canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouse.targetX = e.clientX - rect.left;
      stateRef.current.mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      stateRef.current.mouse.targetX = -1000;
      stateRef.current.mouse.targetY = -1000;
    };

    // Clicking fires quick packet pulses starting from nearby nodes
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const parts = stateRef.current.particles;
      const packList = stateRef.current.packets;

      // Find closest nodes
      const sourceNodes = parts
        .map((p, idx) => ({ idx, dist: Math.hypot(p.x - clickX, p.y - clickY) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 5);

      sourceNodes.forEach(src => {
        const startNode = parts[src.idx];
        // Spark target links
        parts.forEach((tgt, tIdx) => {
          if (src.idx !== tIdx) {
            const dist = Math.hypot(startNode.x - tgt.x, startNode.y - tgt.y);
            if (dist < stateRef.current.connectDistance * 1.2 && Math.random() > 0.4) {
              packList.push({
                startX: startNode.x,
                startY: startNode.y,
                currentX: startNode.x,
                currentY: startNode.y,
                targetX: tgt.x,
                targetY: tgt.y,
                progress: 0,
                speed: 0.02 + Math.random() * 0.03,
                color: stateRef.current.overloadMode ? "#ef4444" : "#22d3ee"
              });
            }
          }
        });
      });

      // Update hud stats packet trigger count
      setHudStats(prev => ({
        ...prev,
        packets: prev.packets + sourceNodes.length,
        bandwidth: `${(parseFloat(prev.bandwidth) + sourceNodes.length * 4.2).toFixed(1)} MB/s`
      }));
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleCanvasClick);

    // Animation Loop
    const draw = (time: number) => {
      if (!visible) {
        animFrame = requestAnimationFrame(draw);
        return;
      }

      // FPS counting
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / (time - lastFpsUpdate));
        setHudStats(prev => ({
          ...prev,
          fps: currentFps,
          temperature: `${Math.round(35 + (stateRef.current.particles.length / 10) + (stateRef.current.overloadMode ? 18 : 0) + (currentFps > 55 ? 2 : 5))}°C`
        }));
        frameCount = 0;
        lastFpsUpdate = time;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = stateRef.current.mouse;
      const particles = stateRef.current.particles;
      const packets = stateRef.current.packets;
      const preset = stateRef.current.activePreset;
      const maxDist = stateRef.current.connectDistance;
      const isOverload = stateRef.current.overloadMode;

      // Linear interpolation for smooth mouse coordinate tracking
      if (mouse.targetX !== -1000) {
        if (mouse.x === -1000) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.12;
          mouse.y += (mouse.targetY - mouse.y) * 0.12;
        }
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // Update and draw connections first
      ctx.lineWidth = 0.65;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            // Transparency scales inversely with distance
            const alpha = (1 - dist / maxDist) * (isOverload ? 0.35 : 0.16);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            if (isOverload) {
              // Pulse fiery red/cyan hues
              ctx.strokeStyle = `rgba(${Math.sin(time * 0.005 + i) > 0 ? "239, 68, 68" : "6, 182, 212"}, ${alpha})`;
            } else if (preset === "matrix") {
              ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            } else if (preset === "quantum") {
              ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
            } else {
              ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            }
            ctx.stroke();
          }
        }
      }

      // Render flowing packet lines
      packets.forEach((p, idx) => {
        p.progress += p.speed;
        p.currentX = p.startX + (p.targetX - p.startX) * p.progress;
        p.currentY = p.startY + (p.targetY - p.startY) * p.progress;

        // Glowing packet dot
        ctx.beginPath();
        ctx.arc(p.currentX, p.currentY, isOverload ? 3.5 : 2.0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Packet tail
        ctx.beginPath();
        ctx.moveTo(p.currentX, p.currentY);
        const tailMult = 0.18;
        const tailX = p.currentX - (p.targetX - p.startX) * tailMult;
        const tailY = p.currentY - (p.targetY - p.startY) * tailMult;
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Retain or slice finished packets
        if (p.progress >= 1.0) {
          packets.splice(idx, 1);
        }
      });

      // Update particles physics and draw
      particles.forEach((p, index) => {
        // Preset special motions
        if (preset === "matrix") {
          p.y += p.vy;
          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
        } else if (preset === "vortex") {
          // Circular vortex gravity flow
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          
          // Speed scale based on center proximity
          const speed = (isOverload ? 2.5 : 1.0) * (300 / (dist + 150));
          p.vx += (-dy / dist) * 0.08 * speed;
          p.vy += (dx / dist) * 0.08 * speed;

          // Drag to avoid infinite acceleration
          p.vx *= 0.97;
          p.vy *= 0.97;

          p.x += p.vx;
          p.y += p.vy;

          if (dist > Math.max(canvas.width, canvas.height) * 0.75) {
            p.x = cx + (Math.random() - 0.5) * 100;
            p.y = cy + (Math.random() - 0.5) * 100;
            p.vx = 0;
            p.vy = 0;
          }
        } else {
          // Normal physics
          p.x += p.vx * (isOverload ? 3.0 : 1.0);
          p.y += p.vy * (isOverload ? 3.0 : 1.0);

          // Boundary bounce or wrap-around
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        // Mouse influence gravity/repulsion setup
        if (mouse.x !== -1000) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 180) {
            const force = (180 - dist) / 180;
            if (stateRef.current.mouseGravity) {
              // Attract / Pull smoothly towards cursor
              p.x -= (dx / dist) * force * 2.2;
              p.y -= (dy / dist) * force * 2.2;
            } else {
              // Repel / Push away aggressively from cursor
              p.x += (dx / dist) * force * 4.0;
              p.y += (dy / dist) * force * 4.0;
            }
          }
        }

        // Overload state rapid color shifting
        let renderColor = p.color;
        let pGlow = p.glowColor;
        if (isOverload) {
          const hue = (index * 4 + time * 0.15) % 360;
          renderColor = `hsla(${hue}, 95%, 60%, 1)`;
          pGlow = `hsla(${hue}, 95%, 60%, 0.8)`;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = renderColor;
        ctx.fill();

        // Starry radial halos for spiky nodes
        if (p.radius > 2 || isOverload) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (isOverload ? 3.2 : 2.4), 0, Math.PI * 2);
          ctx.fillStyle = pGlow;
          ctx.fill();
        }
      });

      // Periodic natural random network packet sparks
      if (Math.random() > 0.93 && particles.length > 5) {
        const randSrcIdx = Math.floor(Math.random() * particles.length);
        const startNode = particles[randSrcIdx];
        
        // Find close target link
        for (let j = 0; j < particles.length; j++) {
          if (randSrcIdx !== j) {
            const tgt = particles[j];
            const dist = Math.hypot(startNode.x - tgt.x, startNode.y - tgt.y);
            if (dist < maxDist && Math.random() > 0.7) {
              packets.push({
                startX: startNode.x,
                startY: startNode.y,
                currentX: startNode.x,
                currentY: startNode.y,
                targetX: tgt.x,
                targetY: tgt.y,
                progress: 0,
                speed: 0.008 + Math.random() * 0.015,
                color: isOverload ? "#f87171" : "#06b6d4"
              });
              break;
            }
          }
        }
      }

      // Keep animation clean
      animFrame = requestAnimationFrame(draw);
    };

    animFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("click", handleCanvasClick);
      }
      cancelAnimationFrame(animFrame);
    };
  }, [visible]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {/* Background Interactive Canvas */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full block select-none pointer-events-auto transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
        title="Interactive Cyber System Backdrop: Click to spark high-frequency data packets!"
      />

      {/* Futuristic Floating HUD Control Deck */}
      <div className="fixed bottom-24 right-6 pointer-events-auto z-40">
        <div className="relative">
          {/* Main Floating Trigger Button */}
          <button
            id="quantum-showpiece-trigger"
            onClick={() => setIsOpen(!isOpen)}
            className="group flex items-center justify-center w-12 h-12 bg-slate-950/90 border border-slate-900 rounded-full text-cyan-400 hover:text-cyan-300 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] shadow-xl cursor-pointer transition-all duration-300"
            title="Sintezator / Quantum HUD"
          >
            <Cpu className={`w-5 h-5 transition-transform duration-500 ${isOpen ? "rotate-180 text-rose-400" : "group-hover:rotate-45"}`} />
            
            {/* Status signal dot */}
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full border border-slate-950 animate-ping" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full border border-slate-950" />
          </button>

          {/* Interactive HUD Settings Panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className="absolute bottom-16 right-0 w-80 bg-slate-950/95 border border-slate-900 rounded-xl p-5 shadow-2xl backdrop-blur-md text-xs font-mono select-none space-y-4"
              >
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-100 uppercase tracking-wider">Holograph Kern HUD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-900/40 rounded font-bold">
                      FPS: {hudStats.fps}
                    </span>
                    <button
                      onClick={() => setVisible(!visible)}
                      className="text-slate-500 hover:text-slate-200 transition"
                      title={visible ? "Fonni o'chirish" : "Fonni yoqish"}
                    >
                      {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-slate-500 hover:text-slate-200 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub title */}
                <div className="text-[9px] text-slate-500 leading-normal font-sans">
                  Ekran bo'g'ozida istalgan joyga bosing — yorug'lik tarmoqlari o'rtasida shifrlangan ma'lumot trafigi sintezlanadi.
                </div>

                {/* Cyber Presets Trigger */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] text-zinc-500 uppercase">Sinaps Ssenariysi (Preset)</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "cyber", name: "Cyber Net", color: "text-cyan-400 border-cyan-500" },
                      { id: "vortex", name: "Vortex Grav", color: "text-indigo-400 border-indigo-500" },
                      { id: "matrix", name: "Rain Green", color: "text-emerald-400 border-emerald-500" },
                      { id: "quantum", name: "Pink Micro", color: "text-pink-400 border-pink-500" },
                    ].map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => setActivePreset(preset.id as any)}
                        className={`py-1.5 px-2 bg-slate-900/60 border rounded text-[10px] transition text-left cursor-pointer ${
                          activePreset === preset.id 
                            ? "bg-slate-900 border-slate-700 font-bold " + preset.color 
                            : "border-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats indicators */}
                <div className="bg-slate-900/30 border border-slate-900 rounded p-2 text-[10px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Aktiv Tarmoq Tugunlari:</span>
                    <span className="text-slate-200 font-bold">{particleCount} ta</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sintezlangan Paketlar:</span>
                    <span className="text-cyan-400 font-bold">{hudStats.packets} ta</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spektr Chastotasi:</span>
                    <span className="text-slate-200 font-bold">{hudStats.bandwidth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rezonans Harorati:</span>
                    <span className={`${overloadMode ? "text-red-400" : "text-emerald-400"} font-bold`}>{hudStats.temperature}</span>
                  </div>
                </div>

                {/* Controls - range inputs */}
                <div className="space-y-2 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500 uppercase">Tugunlar soni</span>
                      <span className="text-slate-300 font-bold">{particleCount}</span>
                    </div>
                    <input 
                      type="range"
                      min="40"
                      max="240"
                      step="10"
                      value={particleCount}
                      onChange={(e) => setParticleCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500 uppercase">Tortishish Masofasi</span>
                      <span className="text-slate-300 font-bold">{connectDistance}px</span>
                    </div>
                    <input 
                      type="range"
                      min="60"
                      max="220"
                      step="10"
                      value={connectDistance}
                      onChange={(e) => setConnectDistance(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setMouseGravity(!mouseGravity)}
                    className={`py-1 bg-slate-900/60 border rounded text-[10px] uppercase font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      mouseGravity 
                        ? "border-cyan-900/60 text-cyan-400" 
                        : "border-rose-950/60 text-rose-400"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${mouseGravity ? "bg-cyan-400" : "bg-rose-400"}`} />
                    {mouseGravity ? "Magnit tort" : "Qochib ket"}
                  </button>

                  <button
                    onClick={() => setOverloadMode(!overloadMode)}
                    className={`py-1 bg-slate-900/60 border rounded text-[10px] uppercase font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      overloadMode 
                        ? "bg-red-950/50 border-red-900/70 text-red-400" 
                        : "border-slate-900/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${overloadMode ? "text-red-400 animate-bounce" : "text-slate-500"}`} />
                    {overloadMode ? "OVERLOAD ON" : "KUCHAYTIRISH"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
