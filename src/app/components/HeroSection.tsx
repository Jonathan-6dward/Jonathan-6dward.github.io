import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Eye } from "lucide-react";

const lines = [
  "> Inicializando console SOC...",
  "> Conectando ao SIEM...",
  "> QRadar | Sentinel | Google SecOps — OK",
  "> CrowdStrike EDR — ATIVO",
  "> WAF Imperva — MONITORANDO",
  "> Triagem de alertas em andamento...",
  "> Analista N1 — Blue Team — ONLINE ✓",
];

export function HeroSection() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [typing, setTyping] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (lineIdx >= lines.length) {
      setDone(true);
      return;
    }
    const currentLine = lines[lineIdx];
    if (charIdx < currentLine.length) {
      const t = setTimeout(() => {
        setTyping((prev) => prev + currentLine[charIdx]);
        setCharIdx((c) => c + 1);
      }, 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, currentLine]);
        setTyping("");
        setCharIdx(0);
        setLineIdx((l) => l + 1);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, done]);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center items-center px-4 pt-14 bg-[#0a0d14] relative overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#00ff9d 1px, transparent 1px), linear-gradient(90deg, #00ff9d 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#00ff9d]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-[#0066ff]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center gap-8">
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 border border-[#00ff9d]/30 rounded-full bg-[#00ff9d]/5">
          <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
          <span className="text-xs font-mono text-[#00ff9d]">Blue Team — Analista SOC N1</span>
        </div>

        {/* Name */}
        <div className="text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-mono text-white mb-3"
            style={{ fontWeight: 700 }}
          >
            Jonathan Edward
          </h1>
          <p className="text-[#8892b0] font-mono text-base sm:text-lg max-w-xl mx-auto">
            Monitoramento · Investigação · Resposta a Incidentes
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          {[
            { icon: <Eye size={18} />, label: "Alertas Triados", value: "1.200+" },
            { icon: <AlertTriangle size={18} />, label: "Incidentes", value: "N1 → N2" },
            { icon: <Shield size={18} />, label: "Ferramentas", value: "6+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 p-3 border border-[#00ff9d]/15 rounded-lg bg-[#0d1117]"
            >
              <span className="text-[#00ff9d]">{stat.icon}</span>
              <span className="text-white font-mono text-sm" style={{ fontWeight: 700 }}>{stat.value}</span>
              <span className="text-[#8892b0] text-xs font-mono text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Terminal */}
        <div className="w-full max-w-2xl rounded-xl border border-[#00ff9d]/20 bg-[#0d1117] overflow-hidden shadow-2xl shadow-[#00ff9d]/5">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-xs font-mono text-[#8892b0]">soc-console — bash</span>
          </div>
          {/* Terminal body */}
          <div className="p-4 min-h-[200px] font-mono text-sm">
            {visibleLines.map((line, i) => (
              <p key={i} className="text-[#00ff9d] mb-1 leading-relaxed">{line}</p>
            ))}
            {!done && (
              <p className="text-[#00ff9d] mb-1 leading-relaxed">
                {typing}
                <span className="animate-pulse">█</span>
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
              document.querySelector("#atuacao")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 bg-[#00ff9d] text-[#0a0d14] font-mono text-sm rounded-lg hover:bg-[#00e68a] transition-colors"
            style={{ fontWeight: 700 }}
          >
            Ver Atuação →
          </button>
          <button
            onClick={() => {
              document.querySelector("#sobre")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 border border-[#00ff9d]/40 text-[#00ff9d] font-mono text-sm rounded-lg hover:bg-[#00ff9d]/10 transition-colors"
          >
            Sobre Mim
          </button>
        </div>
      </div>
    </section>
  );
}