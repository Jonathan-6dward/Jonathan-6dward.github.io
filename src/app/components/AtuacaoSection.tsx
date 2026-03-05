import { Shield, AlertTriangle, Search, TrendingUp, Bell, GitMerge } from "lucide-react";

const atividades = [
  {
    icon: <Bell size={22} />,
    color: "#00ff9d",
    titulo: "Monitoramento Contínuo",
    descricao:
      "Monitoramento proativo de eventos de segurança em tempo real via SIEM (QRadar, Sentinel, Google SecOps), identificando comportamentos anômalos e padrões de ameaça em ambientes corporativos.",
    tags: ["QRadar", "Sentinel", "Google SecOps"],
  },
  {
    icon: <AlertTriangle size={22} />,
    color: "#e25822",
    titulo: "Triagem & Classificação de Alertas",
    descricao:
      "Análise e triagem de alertas gerados pelo SIEM e EDR, classificando incidentes por severidade e prioridade, reduzindo falsos positivos e garantindo foco nos eventos críticos.",
    tags: ["Alert Triage", "False Positive Reduction", "Severity Classification"],
  },
  {
    icon: <Search size={22} />,
    color: "#0066ff",
    titulo: "Análise de Logs & Correlação",
    descricao:
      "Análise aprofundada de logs de diferentes fontes (endpoints, rede, aplicações), correlacionando eventos para mapear o contexto de possíveis ataques e identificar indicadores de comprometimento (IoCs).",
    tags: ["Log Analysis", "Event Correlation", "IoC Detection"],
  },
  {
    icon: <Shield size={22} />,
    color: "#bd93f9",
    titulo: "EDR & Proteção de Endpoints",
    descricao:
      "Investigação de alertas do CrowdStrike Falcon para identificar ameaças em endpoints, analisar comportamento de processos suspeitos, e responder a detecções de malware e técnicas de persistência.",
    tags: ["CrowdStrike Falcon", "Endpoint Security", "Malware Analysis"],
  },
  {
    icon: <GitMerge size={22} />,
    color: "#ff79c6",
    titulo: "Escalonamento Técnico",
    descricao:
      "Documentação e escalonamento estruturado de incidentes para times N2/N3, com contexto técnico detalhado (timeline, evidências, hipóteses) para aceleração do ciclo de resposta.",
    tags: ["Escalation", "Incident Documentation", "Ticket Management"],
  },
  {
    icon: <TrendingUp size={22} />,
    color: "#f1fa8c",
    titulo: "Melhoria de Detecções",
    descricao:
      "Contribuição ativa na revisão e ajuste de regras de correlação no SIEM, melhoria contínua de detecções e fortalecimento da postura de segurança em ambientes corporativos de grande escala.",
    tags: ["Rule Tuning", "Detection Engineering", "Security Posture"],
  },
];

export function AtuacaoSection() {
  return (
    <section id="atuacao" className="py-20 px-4 bg-[#0a0d14]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-mono text-[#00ff9d] mb-2">// atuacao_profissional.log</p>
          <h2 className="text-2xl sm:text-3xl font-mono text-white" style={{ fontWeight: 700 }}>
            Atuação como SOC N1
          </h2>
          <p className="text-[#8892b0] font-mono text-sm mt-2 max-w-lg mx-auto">
            Responsabilidades e atividades diárias no Blue Team
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {atividades.map((item, i) => (
            <div
              key={i}
              className="relative p-6 rounded-xl border border-[#1e2130] bg-[#0d1117] hover:border-opacity-60 transition-all group overflow-hidden"
              style={{ borderLeftWidth: 3, borderLeftColor: item.color }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top left, ${item.color}08, transparent 70%)` }}
              />

              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-3">
                  <span style={{ color: item.color }} className="mt-0.5 shrink-0">{item.icon}</span>
                  <h3
                    className="font-mono text-white text-base"
                    style={{ fontWeight: 600 }}
                  >
                    {item.titulo}
                  </h3>
                </div>
                <p className="text-[#8892b0] text-sm font-mono leading-relaxed mb-4">
                  {item.descricao}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-mono rounded"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary quote */}
        <div className="mt-12 p-6 rounded-xl border border-[#00ff9d]/20 bg-[#0d1117] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00ff9d]" />
          <p className="font-mono text-[#cdd6f4] text-sm leading-relaxed pl-4">
            <span className="text-[#00ff9d]">"</span>
            Atuação em monitoramento e investigação de incidentes utilizando SIEM (QRadar, Sentinel, Google SecOps),
            EDR (CrowdStrike) e soluções de segurança como WAF (Imperva) para proteção de aplicações web.
            Realizo triagem de alertas, análise de logs, correlação de eventos, classificação de incidentes e
            escalonamento técnico. Contribuo na melhoria de detecções, revisão de regras e fortalecimento contínuo
            da postura de segurança em ambientes corporativos.
            <span className="text-[#00ff9d]">"</span>
          </p>
          <p className="mt-3 pl-4 text-xs font-mono text-[#8892b0]">— Jonathan Edward · Analista SOC N1 | Blue Team</p>
        </div>
      </div>
    </section>
  );
}