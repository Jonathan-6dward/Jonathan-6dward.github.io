import { Monitor, Cpu, Globe, Search, FileText, GitBranch } from "lucide-react";

const categories = [
  {
    icon: <Monitor size={20} />,
    title: "SIEM",
    color: "#00ff9d",
    tools: [
      { name: "IBM QRadar", level: 85 },
      { name: "Microsoft Sentinel", level: 80 },
      { name: "Google SecOps (Chronicle)", level: 75 },
    ],
  },
  {
    icon: <Cpu size={20} />,
    title: "EDR",
    color: "#e25822",
    tools: [
      { name: "CrowdStrike Falcon", level: 82 },
    ],
  },
  {
    icon: <Globe size={20} />,
    title: "WAF / Proteção Web",
    color: "#0066ff",
    tools: [
      { name: "Imperva WAF", level: 78 },
    ],
  },
  {
    icon: <Search size={20} />,
    title: "Análise & Investigação",
    color: "#bd93f9",
    tools: [
      { name: "Triagem de Alertas", level: 90 },
      { name: "Análise de Logs", level: 88 },
      { name: "Correlação de Eventos", level: 84 },
      { name: "Classificação de Incidentes", level: 87 },
    ],
  },
  {
    icon: <FileText size={20} />,
    title: "Processos & Frameworks",
    color: "#ff79c6",
    tools: [
      { name: "MITRE ATT&CK", level: 76 },
      { name: "Kill Chain Analysis", level: 73 },
      { name: "Escalonamento Técnico", level: 88 },
    ],
  },
  {
    icon: <GitBranch size={20} />,
    title: "Detecção & Regras",
    color: "#f1fa8c",
    tools: [
      { name: "Revisão de Regras SIEM", level: 80 },
      { name: "Melhoria de Detecções", level: 77 },
      { name: "Hardening de Postura", level: 74 },
    ],
  },
];

function SkillBar({ name, level, color }: { name: string; level: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-[#cdd6f4]">{name}</span>
        <span className="text-xs font-mono" style={{ color }}>{level}%</span>
      </div>
      <div className="h-1.5 bg-[#1e2130] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${level}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function SkillsSection() {
  return (
    <section id="skills" className="py-20 px-4 bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-mono text-[#00ff9d] mb-2">// habilidades_tecnicas.json</p>
          <h2 className="text-2xl sm:text-3xl font-mono text-white" style={{ fontWeight: 700 }}>
            Stack de Segurança
          </h2>
          <p className="text-[#8892b0] font-mono text-sm mt-2 max-w-lg mx-auto">
            Ferramentas e competências utilizadas no dia a dia como Analista SOC N1
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="p-5 rounded-xl border bg-[#0a0d14] hover:border-opacity-60 transition-all"
              style={{ borderColor: `${cat.color}25` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: cat.color }}>{cat.icon}</span>
                <span className="text-sm font-mono" style={{ color: cat.color, fontWeight: 600 }}>
                  {cat.title}
                </span>
              </div>
              {cat.tools.map((tool) => (
                <SkillBar key={tool.name} name={tool.name} level={tool.level} color={cat.color} />
              ))}
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {[
            "SIEM", "EDR", "WAF", "Log Analysis", "Threat Detection",
            "Incident Response", "Blue Team", "MITRE ATT&CK", "SOC N1",
            "Alert Triage", "Event Correlation", "Security Hardening"
          ].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-mono border border-[#00ff9d]/20 text-[#8892b0] rounded-full bg-[#0a0d14] hover:text-[#00ff9d] hover:border-[#00ff9d]/50 transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
