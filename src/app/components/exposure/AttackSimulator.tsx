import { useState } from "react";

const MONO = "'Share Tech Mono', 'Fira Code', monospace";
const ORBITRON = "'Orbitron', sans-serif";

interface RiskEntry {
  field: string;
  icon: string;
  level: "HIGH" | "MEDIUM";
  vectors: string[];
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  username: string;
  city: string;
  company: string;
}

const RISK_MAP: Record<keyof FormData, RiskEntry> = {
  email: {
    field: "EMAIL", icon: "📧", level: "HIGH",
    vectors: [
      "Enumeração de conta em 200+ plataformas",
      "Credential stuffing se estiver em bases de vazamento",
      "Ponto de entrada para campanha de phishing direcionado",
      "Vetor de hijacking de redefinição de senha",
      "Correlação de identidade entre plataformas",
    ],
  },
  phone: {
    field: "TELEFONE", icon: "📱", level: "HIGH",
    vectors: [
      "Superfície de ataque para SIM swapping",
      "Engenharia social via WhatsApp/Telegram",
      "Campanhas de SMS phishing (smishing)",
      "Bypass de recuperação de conta",
      "Reverse lookup revela nome completo + endereço",
    ],
  },
  username: {
    field: "USERNAME", icon: "🔖", level: "HIGH",
    vectors: [
      "Agregação de perfil entre plataformas",
      "Encontrado em: Instagram · Twitter · GitHub · Reddit · TikTok · LinkedIn",
      "Histórico de posts revela localização, emprego, relacionamentos",
      "Inferência de padrão de senha por perfis antigos",
    ],
  },
  name: {
    field: "NOME", icon: "📛", level: "MEDIUM",
    vectors: [
      "Combinado com cidade: perfil LinkedIn encontrado",
      "Combinado com email: perfil de identidade completo criado",
      "Material de pretexting para engenharia social",
    ],
  },
  city: {
    field: "CIDADE", icon: "📍", level: "MEDIUM",
    vectors: [
      "Estreita localização física para ataques direcionados",
      "Dados de eventos/negócios locais usados para pretexting",
      "Combinado com nome: lookup de endereço possível",
    ],
  },
  company: {
    field: "EMPRESA", icon: "🏢", level: "MEDIUM",
    vectors: [
      "Inferência de padrão de email corporativo (nome@empresa.com)",
      "Mapeamento de colegas via LinkedIn",
      "Spear phishing com contexto da empresa",
    ],
  },
};

function RiskBlock({ entry, delay }: { entry: RiskEntry; delay: number }) {
  const isHigh = entry.level === "HIGH";
  const color = isHigh ? "#FF2D2D" : "#F0A500";
  return (
    <div
      style={{
        background: "#0D1117",
        border: `1px solid ${isHigh ? "rgba(255,45,45,0.25)" : "rgba(240,165,0,0.25)"}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 4,
        padding: 20,
        marginBottom: 12,
        animation: `slideUp 0.4s ease ${delay}ms both`,
        fontFamily: MONO,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "#E6EDF3", fontSize: "0.85rem" }}>
          {entry.icon}&nbsp; {entry.field}
        </span>
        <span
          style={{
            background: isHigh ? "rgba(255,45,45,0.12)" : "rgba(240,165,0,0.12)",
            border: `1px solid ${color}`,
            color,
            fontSize: "0.6rem",
            letterSpacing: 2,
            padding: "3px 10px",
            borderRadius: 100,
          }}
        >
          {entry.level} RISK
        </span>
      </div>
      <div style={{ borderTop: "1px solid #21262D", paddingTop: 12 }}>
        {entry.vectors.map((v, i) => (
          <p key={i} style={{ color: "#8B949E", fontSize: "0.75rem", padding: "3px 0", lineHeight: 1.5 }}>
            <span style={{ color: "#FF2D2D" }}>✗&nbsp;</span>{v}
          </p>
        ))}
      </div>
    </div>
  );
}

function InputField({
  icon, label, placeholder, value, risk, onChange,
}: {
  icon: string; label: string; placeholder: string;
  value: string; risk: "high" | "medium";
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const riskColor = risk === "high" ? "#FF2D2D" : "#F0A500";

  return (
    <div style={{ fontFamily: MONO }}>
      <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 2, marginBottom: 6 }}>
        {icon}&nbsp; {label}
      </p>
      <div style={{ position: "relative" }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#0D1117",
            border: `1px solid ${focused ? "#00FF41" : hasValue ? "rgba(0,255,65,0.4)" : "#21262D"}`,
            borderRadius: 2,
            padding: "12px 40px 12px 14px",
            color: "#E6EDF3",
            fontFamily: MONO,
            fontSize: "0.8rem",
            outline: "none",
            transition: "border 120ms ease",
            boxShadow: focused ? "0 0 0 3px rgba(0,255,65,0.1)" : "none",
          }}
        />
        {hasValue && (
          <span
            title={risk === "high" ? "Alto risco" : "Risco médio"}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: riskColor,
              boxShadow: `0 0 6px ${riskColor}`,
            }}
          />
        )}
      </div>
    </div>
  );
}

export function AttackSimulator({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", username: "", city: "", company: "",
  });
  const [simulating, setSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<RiskEntry[]>([]);
  const [showResults, setShowResults] = useState(false);

  const set = (field: keyof FormData) => (v: string) =>
    setForm(prev => ({ ...prev, [field]: v }));

  const handleRun = () => {
    const filled = (Object.keys(form) as (keyof FormData)[]).filter(k => form[k].trim() !== "");
    if (filled.length === 0) return;
    setSimulating(true);
    setShowResults(false);
    setProgress(0);

    const start = Date.now();
    const raf = () => {
      const p = Math.min(((Date.now() - start) / 1500) * 100, 100);
      setProgress(Math.round(p));
      if (p < 100) {
        requestAnimationFrame(raf);
      } else {
        const entries = filled.map(k => RISK_MAP[k]);
        setResults(entries);
        setSimulating(false);
        setShowResults(true);
      }
    };
    requestAnimationFrame(raf);
  };

  const filledCount = Object.values(form).filter(v => v.trim() !== "").length;
  const combinedScore = Math.min(
    results.reduce((acc, r) => acc + (r.level === "HIGH" ? 25 : 15), 20),
    100
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "80px 16px 80px",
        fontFamily: MONO,
        position: "relative",
        zIndex: 1,
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: ORBITRON,
              fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
              fontWeight: 700,
              color: "#FF2D2D",
              letterSpacing: 4,
              marginBottom: 24,
              textShadow: "0 0 20px #FF2D2D40",
            }}
          >
            ATTACKER SIMULATION MODE
          </h2>
          <div
            style={{
              background: "rgba(240,165,0,0.08)",
              border: "1px solid rgba(240,165,0,0.3)",
              borderLeft: "4px solid #F0A500",
              borderRadius: 4,
              padding: "16px 20px",
              textAlign: "left",
            }}
          >
            <p style={{ color: "#F0A500", fontSize: "0.72rem", letterSpacing: 2, marginBottom: 8 }}>
              ⚠ SIMULAÇÃO EDUCACIONAL APENAS
            </p>
            <p style={{ color: "#8B949E", fontSize: "0.78rem", lineHeight: 1.6 }}>
              Esta ferramenta demonstra o que um atacante pode inferir com dados que você compartilha publicamente.
              Nenhuma informação é armazenada, enviada ou utilizada além desta simulação.
            </p>
          </div>
        </div>

        {/* Form */}
        <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 3, marginBottom: 20 }}>
          INSIRA DADOS QUE VOCÊ TIPICAMENTE COMPARTILHA ONLINE:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
          <InputField icon="📛" label="NOME" placeholder="john_doe" value={form.name} risk="medium" onChange={set("name")} />
          <InputField icon="📧" label="EMAIL" placeholder="você@dominio.com" value={form.email} risk="high" onChange={set("email")} />
          <InputField icon="📱" label="TELEFONE" placeholder="+55 11 99999-9999" value={form.phone} risk="high" onChange={set("phone")} />
          <InputField icon="🔖" label="USERNAME" placeholder="@seuhandle" value={form.username} risk="high" onChange={set("username")} />
          <InputField icon="📍" label="CIDADE" placeholder="São Paulo" value={form.city} risk="medium" onChange={set("city")} />
          <InputField icon="🏢" label="EMPRESA" placeholder="Acme Corp" value={form.company} risk="medium" onChange={set("company")} />
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={simulating || filledCount === 0}
          style={{
            width: "100%",
            padding: "16px",
            background: simulating ? "rgba(255,45,45,0.1)" : "transparent",
            border: "1px solid #FF2D2D",
            borderRadius: 2,
            color: filledCount === 0 ? "#484F58" : "#FF2D2D",
            fontFamily: MONO,
            fontSize: "0.82rem",
            letterSpacing: 4,
            cursor: filledCount === 0 || simulating ? "not-allowed" : "pointer",
            transition: "all 220ms ease",
            marginBottom: 32,
          }}
          onMouseEnter={e => {
            if (filledCount === 0 || simulating) return;
            const el = e.currentTarget;
            el.style.background = "#FF2D2D";
            el.style.color = "#080B0F";
            el.style.boxShadow = "0 0 12px #FF2D2D55, 0 0 30px #FF2D2D20";
            el.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.background = simulating ? "rgba(255,45,45,0.1)" : "transparent";
            el.style.color = filledCount === 0 ? "#484F58" : "#FF2D2D";
            el.style.boxShadow = "none";
            el.style.transform = "translateY(0)";
          }}
        >
          {simulating
            ? `▶ ANALISANDO... [${"█".repeat(Math.floor(progress / 10))}${"░".repeat(10 - Math.floor(progress / 10))}]`
            : "▶  EXECUTAR SIMULAÇÃO DE ATAQUE"
          }
        </button>

        {/* Results */}
        {showResults && (
          <div style={{ animation: "slideUp 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 24, height: 2, background: "#FF2D2D" }} />
              <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 4 }}>
                VETORES DE ATAQUE IDENTIFICADOS
              </p>
            </div>
            {results.map((entry, i) => (
              <RiskBlock key={entry.field} entry={entry} delay={i * 100} />
            ))}
            {/* Combined score */}
            <div
              style={{
                background: "#0D1117",
                border: "1px solid #FF2D2D",
                borderRadius: 4,
                padding: "24px",
                textAlign: "center",
                marginTop: 24,
              }}
            >
              <p
                style={{
                  fontFamily: ORBITRON,
                  fontSize: "clamp(1rem, 3vw, 1.4rem)",
                  fontWeight: 700,
                  color: "#FF2D2D",
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                SURFACE DE ATAQUE COMBINADA: {combinedScore} / 100
              </p>
              <p style={{ color: "#8B949E", fontSize: "0.78rem", lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
                Com esses dados, um atacante tem o suficiente para lançar uma campanha de
                spear phishing ou account takeover direcionada.
              </p>
            </div>
          </div>
        )}

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button
            onClick={onBack}
            style={{
              padding: "10px 24px",
              background: "transparent",
              border: "1px solid #21262D",
              borderRadius: 4,
              color: "#484F58",
              fontFamily: MONO,
              fontSize: "0.72rem",
              letterSpacing: 2,
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#8B949E"; e.currentTarget.style.borderColor = "#484F58"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#484F58"; e.currentTarget.style.borderColor = "#21262D"; }}
          >
            ← VOLTAR AO DASHBOARD
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}
