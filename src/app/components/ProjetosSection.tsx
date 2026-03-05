import { ExternalLink, Github, Shield, Search, Cpu, Globe } from "lucide-react";

const projetos = [
  {
    icon: <Shield size={20} />,
    color: "#00ff9d",
    categoria: "Blue Team",
    titulo: "Digital Exposure Portfolio",
    descricao:
      "Projeto educativo interativo que demonstra dados coletáveis por browser fingerprinting — localização via IP, device info, canvas hash, WebGL, AudioContext. Objetivo: conscientizar usuários sobre exposição digital.",
    stack: ["HTML", "CSS", "JavaScript", "IP Geolocation", "Canvas API"],
    github: "https://github.com",
    demo: "https://github.com",
    status: "Em desenvolvimento",
    statusColor: "#f1fa8c",
  },
  {
    icon: <Search size={20} />,
    color: "#0066ff",
    categoria: "SOC Research",
    titulo: "SIEM Alert Playbook",
    descricao:
      "Documentação de playbooks de resposta a incidentes para os principais tipos de alertas SOC — brute force, lateral movement, data exfiltration, C2 beaconing. Baseado em MITRE ATT&CK.",
    stack: ["Markdown", "MITRE ATT&CK", "QRadar", "Sentinel"],
    github: "https://github.com",
    demo: null,
    status: "Público",
    statusColor: "#00ff9d",
  },
  {
    icon: <Cpu size={20} />,
    color: "#bd93f9",
    categoria: "Detection Engineering",
    titulo: "CrowdStrike Detection Notes",
    descricao:
      "Anotações e análises de detecções do CrowdStrike Falcon — técnicas de evasão detectadas, ajustes de regras, e casos reais de identificação de malware em endpoints corporativos.",
    stack: ["CrowdStrike", "EDR", "Threat Intelligence", "YARA"],
    github: "https://github.com",
    demo: null,
    status: "Privado",
    statusColor: "#e25822",
  },
  {
    icon: <Globe size={20} />,
    color: "#ff79c6",
    categoria: "WAF / AppSec",
    titulo: "Imperva WAF Lab Notes",
    descricao:
      "Laboratório pessoal documentando configurações de WAF, análise de tráfego malicioso bloqueado, casos de SQLi, XSS e bot detection. Foco em proteção de aplicações web em produção.",
    stack: ["Imperva WAF", "OWASP", "HTTP Analysis", "Burp Suite"],
    github: "https://github.com",
    demo: null,
    status: "Em andamento",
    statusColor: "#f1fa8c",
  },
];

export function ProjetosSection() {
  return (
    <section id="projetos" className="py-20 px-4 bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-mono text-[#00ff9d] mb-2">// projetos_e_pesquisas.git</p>
          <h2 className="text-2xl sm:text-3xl font-mono text-white" style={{ fontWeight: 700 }}>
            Projetos & Pesquisas
          </h2>
          <p className="text-[#8892b0] font-mono text-sm mt-2 max-w-lg mx-auto">
            Projetos pessoais, laboratórios e pesquisas em segurança ofensiva e defensiva
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projetos.map((proj, i) => (
            <div
              key={i}
              className="flex flex-col p-6 rounded-xl border border-[#1e2130] bg-[#0a0d14] hover:border-[#30363d] transition-all group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ color: proj.color }}>{proj.icon}</span>
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${proj.color}15`, color: proj.color }}
                  >
                    {proj.categoria}
                  </span>
                </div>
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded border"
                  style={{ color: proj.statusColor, borderColor: `${proj.statusColor}40` }}
                >
                  {proj.status}
                </span>
              </div>

              <h3 className="font-mono text-white mb-2" style={{ fontWeight: 600, fontSize: "1rem" }}>
                {proj.titulo}
              </h3>
              <p className="text-[#8892b0] text-sm font-mono leading-relaxed mb-4 flex-1">
                {proj.descricao}
              </p>

              {/* Stack */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {proj.stack.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 text-xs font-mono rounded bg-[#161b22] text-[#8892b0] border border-[#30363d]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3">
                <a
                  href={proj.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-mono text-[#8892b0] hover:text-[#00ff9d] transition-colors"
                >
                  <Github size={14} />
                  Código
                </a>
                {proj.demo && (
                  <a
                    href={proj.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-mono text-[#8892b0] hover:text-[#00ff9d] transition-colors"
                  >
                    <ExternalLink size={14} />
                    Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
