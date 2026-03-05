import { useEffect, useState } from "react";
import { Shield, Eye, Cpu, Globe, Wifi, Camera, Database, ChevronDown } from "lucide-react";

interface QuickData {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  device_type: string;
  browser_name: string;
  browser_version: string;
  os_raw: string;
}

interface Props {
  quickData: QuickData | null;
  loading: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const MONO = "'Share Tech Mono', 'Fira Code', monospace";
const ORBITRON = "'Orbitron', sans-serif";

const collected = [
  { icon: <Globe size={15} />, text: "Seu endereço IP público e localização aproximada" },
  { icon: <Cpu size={15} />, text: "Seu dispositivo, processador, memória RAM e GPU" },
  { icon: <Eye size={15} />, text: "Uma 'impressão digital' única e invisível do seu aparelho" },
  { icon: <Wifi size={15} />, text: "Seu IP na rede local (vazamento via WebRTC)" },
  { icon: <Camera size={15} />, text: "Quantas câmeras e microfones o seu dispositivo tem" },
  { icon: <Database size={15} />, text: "Quais tecnologias de rastreamento você expõe ao navegar" },
  { icon: <Shield size={15} />, text: "Se você usa (ou não) proteção contra rastreamento" },
];

function Blink({ text, color = "#FF2D2D" }: { text: string; color?: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVisible(v => !v), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ color, opacity: visible ? 1 : 0.3, transition: "opacity 0.1s" }}>
      {text}
    </span>
  );
}

export function ConsentScreen({ quickData, loading, onAccept, onDecline }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (!loading && quickData) {
      const t1 = setTimeout(() => setRevealed(true), 400);
      const t2 = setTimeout(() => setShowConsent(true), 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [loading, quickData]);

  const ip = quickData?.ip ?? "···.···.···.···";
  const city = quickData?.city !== 'unavailable' ? quickData?.city : null;
  const country = quickData?.country !== 'unavailable' ? quickData?.country : null;
  const isp = quickData?.isp !== 'unavailable' ? quickData?.isp : null;
  const browser = quickData?.browser_name !== 'Unknown' ? `${quickData?.browser_name} ${quickData?.browser_version}` : null;
  const device = quickData?.device_type ?? null;

  const shockPhrase = city && isp && browser
    ? `Você está em ${city}, usando ${browser} no ${device}. A rede ${isp} transmite cada clique seu. Você não nos disse nada disso.`
    : city
    ? `Você está em ${city}${country ? ', ' + country : ''}. Você não nos disse nada disso.`
    : "Seu dispositivo acabou de expor dados sem você perceber.";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "80px 16px 60px",
        fontFamily: MONO,
        position: "relative",
        zIndex: 1,
        overflowY: "auto",
      }}
    >
      {/* ── IMPACT SECTION ──────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 680, textAlign: "center" }}>
        <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 3, marginBottom: 32 }}>
          // AMEAÇA DETECTADA — AVALIANDO EXPOSIÇÃO
        </p>

        {/* IP Address Big Display */}
        <div
          style={{
            marginBottom: 24,
            opacity: loading ? 0.4 : 1,
            transition: "opacity 0.5s",
          }}
        >
          <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 3, marginBottom: 8 }}>
            SEU ENDEREÇO IP PÚBLICO
          </p>
          <div
            style={{
              fontFamily: ORBITRON,
              fontSize: "clamp(2rem, 8vw, 3.5rem)",
              fontWeight: 900,
              color: loading ? "#484F58" : "#FF2D2D",
              letterSpacing: "0.05em",
              textShadow: loading ? "none" : "0 0 20px #FF2D2D60, 0 0 50px #FF2D2D30",
              lineHeight: 1.1,
              transition: "all 0.5s",
            }}
          >
            {loading ? <Blink text="ESCANEANDO..." color="#484F58" /> : ip}
          </div>
        </div>

        {/* Revealed data cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 8,
            marginBottom: 32,
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease",
          }}
        >
          {[
            { label: "LOCALIZAÇÃO", value: city && country ? `${city}, ${country}` : city ?? "detectando...", alarm: true },
            { label: "ISP / OPERADORA", value: isp ?? "detectando...", alarm: true },
            { label: "DISPOSITIVO", value: device ?? "detectando...", alarm: false },
            { label: "NAVEGADOR", value: browser ?? "detectando...", alarm: false },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#0D1117",
                border: `1px solid ${item.alarm ? "rgba(255,45,45,0.3)" : "#21262D"}`,
                borderTop: `2px solid ${item.alarm ? "#FF2D2D" : "#21262D"}`,
                borderRadius: 4,
                padding: "12px 16px",
                textAlign: "left",
              }}
            >
              <p style={{ color: "#484F58", fontSize: "0.6rem", letterSpacing: 3, marginBottom: 4 }}>
                {item.label}
              </p>
              <p
                style={{
                  color: item.alarm ? "#FF2D2D" : "#E6EDF3",
                  fontSize: "0.8rem",
                  fontWeight: item.alarm ? "bold" : "normal",
                  wordBreak: "break-all",
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Shock phrase */}
        {revealed && (
          <div
            style={{
              background: "rgba(255,45,45,0.06)",
              border: "1px solid rgba(255,45,45,0.2)",
              borderLeft: "4px solid #FF2D2D",
              borderRadius: 4,
              padding: "16px 20px",
              marginBottom: 40,
              textAlign: "left",
              animation: "slideUp 0.5s ease forwards",
            }}
          >
            <p style={{ color: "#E6EDF3", fontSize: "0.85rem", lineHeight: 1.7 }}>
              ⚠&nbsp;&nbsp;{shockPhrase}
            </p>
          </div>
        )}

        {/* Scroll hint */}
        {revealed && !showConsent && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              color: "#484F58",
              animation: "bounce 1.5s infinite",
            }}
          >
            <ChevronDown size={20} />
          </div>
        )}

        {/* ── CONSENT SECTION ──────────────────────── */}
        {showConsent && (
          <div
            style={{
              marginTop: 8,
              animation: "slideUp 0.5s ease forwards",
            }}
          >
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ flex: 1, height: 1, background: "#21262D" }} />
              <span style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 4 }}>
                CONSENTIMENTO
              </span>
              <div style={{ flex: 1, height: 1, background: "#21262D" }} />
            </div>

            <div
              style={{
                background: "#0D1117",
                border: "1px solid rgba(240,165,0,0.3)",
                borderLeft: "4px solid #F0A500",
                borderRadius: 4,
                padding: "16px 20px",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <p style={{ color: "#F0A500", fontSize: "0.75rem", letterSpacing: 2, marginBottom: 8 }}>
                ⚠ SIMULAÇÃO EDUCACIONAL
              </p>
              <p style={{ color: "#8B949E", fontSize: "0.8rem", lineHeight: 1.7 }}>
                Antes de continuar, vamos te mostrar <strong style={{ color: "#E6EDF3" }}>exatamente o que coletamos</strong> — e por que isso importa para a sua segurança digital. Nenhum dado sai do seu navegador.
              </p>
            </div>

            <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 3, marginBottom: 16, textAlign: "left" }}>
              O QUE SERÁ COLETADO:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32, textAlign: "left" }}>
              {collected.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 14px",
                    background: "#161B22",
                    border: "1px solid #21262D",
                    borderRadius: 4,
                    animation: `slideUp 0.4s ease ${i * 0.07}s both`,
                  }}
                >
                  <span style={{ color: "#00FF41", marginTop: 1 }}>{item.icon}</span>
                  <span style={{ color: "#8B949E", fontSize: "0.78rem", lineHeight: 1.5 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={onAccept}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "transparent",
                  border: "1px solid #00FF41",
                  borderRadius: 4,
                  color: "#00FF41",
                  fontFamily: MONO,
                  fontSize: "0.85rem",
                  letterSpacing: 4,
                  cursor: "pointer",
                  transition: "all 220ms ease",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.background = "#00FF41";
                  el.style.color = "#080B0F";
                  el.style.boxShadow = "0 0 12px #00FF4155, 0 0 30px #00FF4120";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.background = "transparent";
                  el.style.color = "#00FF41";
                  el.style.boxShadow = "none";
                  el.style.transform = "translateY(0)";
                }}
              >
                ✓&nbsp;&nbsp;QUERO VER — ACEITAR E CONTINUAR
              </button>
              <button
                onClick={onDecline}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #21262D",
                  borderRadius: 4,
                  color: "#484F58",
                  fontFamily: MONO,
                  fontSize: "0.78rem",
                  letterSpacing: 2,
                  cursor: "pointer",
                  transition: "all 220ms ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#8B949E"; e.currentTarget.style.borderColor = "#484F58"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#484F58"; e.currentTarget.style.borderColor = "#21262D"; }}
              >
                ✗&nbsp;&nbsp;Prefiro não participar
              </button>
            </div>

            <p style={{ color: "#484F58", fontSize: "0.65rem", textAlign: "center", marginTop: 16 }}>
              ⚠ Nenhum dado é enviado a servidores. Todo processamento é local.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}
