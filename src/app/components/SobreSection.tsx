import { Github, Linkedin, Mail, Award, BookOpen, Target } from "lucide-react";

const certs = [
  { name: "CompTIA Security+", status: "Em progresso", color: "#f1fa8c" },
  { name: "SC-200 — Microsoft Sentinel", status: "Estudando", color: "#0066ff" },
  { name: "Google Cybersecurity Certificate", status: "Concluído", color: "#00ff9d" },
];

const links = [
  {
    icon: <Github size={18} />,
    label: "GitHub",
    href: "https://github.com",
    color: "#8892b0",
  },
  {
    icon: <Linkedin size={18} />,
    label: "LinkedIn",
    href: "https://linkedin.com",
    color: "#0066ff",
  },
  {
    icon: <Mail size={18} />,
    label: "E-mail",
    href: "mailto:contato@exemplo.com",
    color: "#00ff9d",
  },
];

export function SobreSection() {
  return (
    <section id="sobre" className="py-20 px-4 bg-[#0a0d14]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-mono text-[#00ff9d] mb-2">// about_me.txt</p>
          <h2 className="text-2xl sm:text-3xl font-mono text-white" style={{ fontWeight: 700 }}>
            Sobre
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Bio */}
          <div className="lg:col-span-3 space-y-5">
            <div className="p-6 rounded-xl border border-[#1e2130] bg-[#0d1117]">
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-[#00ff9d]" />
                <span className="text-xs font-mono text-[#00ff9d]">perfil</span>
              </div>
              <p className="text-[#cdd6f4] text-sm font-mono leading-relaxed mb-3">
                Analista SOC N1 com atuação em Blue Team, focado em monitoramento contínuo, investigação de
                incidentes e resposta a ameaças em ambientes corporativos.
              </p>
              <p className="text-[#8892b0] text-sm font-mono leading-relaxed">
                Utilizo diariamente ferramentas como <span className="text-[#00ff9d]">IBM QRadar</span>,{" "}
                <span className="text-[#0066ff]">Microsoft Sentinel</span>,{" "}
                <span className="text-[#f1fa8c]">Google SecOps</span>,{" "}
                <span className="text-[#e25822]">CrowdStrike Falcon</span> e{" "}
                <span className="text-[#bd93f9]">Imperva WAF</span> para detectar, classificar e responder a
                incidentes de segurança, contribuindo para o fortalecimento contínuo da postura defensiva
                da organização.
              </p>
            </div>

            {/* Focus */}
            <div className="p-6 rounded-xl border border-[#1e2130] bg-[#0d1117]">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-[#00ff9d]" />
                <span className="text-xs font-mono text-[#00ff9d]">foco_atual</span>
              </div>
              <ul className="space-y-2">
                {[
                  "Detection Engineering — melhoria de regras e correlações SIEM",
                  "Threat Hunting — caça proativa a ameaças não detectadas",
                  "MITRE ATT&CK — mapeamento de TTPs em incidentes reais",
                  "Incident Response — estruturação de playbooks N1",
                  "Certificações — Security+, SC-200",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-mono text-[#8892b0]">
                    <span className="text-[#00ff9d] mt-0.5 shrink-0">▶</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right col */}
          <div className="lg:col-span-2 space-y-5">
            {/* Certifications */}
            <div className="p-6 rounded-xl border border-[#1e2130] bg-[#0d1117]">
              <div className="flex items-center gap-2 mb-4">
                <Award size={16} className="text-[#00ff9d]" />
                <span className="text-xs font-mono text-[#00ff9d]">certificacoes</span>
              </div>
              <div className="space-y-3">
                {certs.map((cert) => (
                  <div key={cert.name} className="flex items-center justify-between gap-2">
                    <span className="text-sm font-mono text-[#cdd6f4]">{cert.name}</span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${cert.color}15`, color: cert.color }}
                    >
                      {cert.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="p-6 rounded-xl border border-[#1e2130] bg-[#0d1117]">
              <p className="text-xs font-mono text-[#00ff9d] mb-4">contato_e_links</p>
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#1e2130] hover:border-[#30363d] transition-colors group"
                  >
                    <span style={{ color: link.color }} className="group-hover:scale-110 transition-transform">
                      {link.icon}
                    </span>
                    <span className="text-sm font-mono text-[#8892b0] group-hover:text-[#cdd6f4] transition-colors">
                      {link.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Status */}
            <div
              className="p-4 rounded-xl border border-[#00ff9d]/20 bg-[#00ff9d]/5 flex items-center gap-3"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff9d] animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-mono text-[#00ff9d]" style={{ fontWeight: 600 }}>
                  Disponível para novas oportunidades
                </p>
                <p className="text-xs font-mono text-[#8892b0]">SOC N1 / N2 · Blue Team · Remote</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}