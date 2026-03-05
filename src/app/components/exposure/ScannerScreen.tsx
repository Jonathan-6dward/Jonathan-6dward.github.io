import { useEffect, useRef, useState } from "react";

interface Props {
  onComplete: () => void;
  isDataReady: boolean;
  deviceHash: string;
}

const MONO = "'Share Tech Mono', 'Fira Code', monospace";
const ORBITRON = "'Orbitron', sans-serif";

interface ScanLine {
  label: string;
  badge: "red" | "amber";
  delay: number;
}

const SCAN_LINES: ScanLine[] = [
  { label: "IP ADDRESS", badge: "red", delay: 0 },
  { label: "GEOLOCATION", badge: "red", delay: 300 },
  { label: "ISP / OPERADORA", badge: "red", delay: 600 },
  { label: "SISTEMA OPERACIONAL", badge: "red", delay: 900 },
  { label: "GPU / PLACA DE VIDEO", badge: "red", delay: 1200 },
  { label: "AUDIO FINGERPRINT", badge: "red", delay: 1500 },
  { label: "CANVAS FINGERPRINT", badge: "red", delay: 1800 },
  { label: "WEBRTC LOCAL IP", badge: "red", delay: 2100 },
  { label: "STATUS DA BATERIA", badge: "amber", delay: 2400 },
  { label: "DISPOSITIVOS DE MIDIA", badge: "amber", delay: 2700 },
  { label: "FONTES INSTALADAS", badge: "amber", delay: 3000 },
  { label: "DEVICE FINGERPRINT", badge: "red", delay: 3300 },
];

const BADGE_LABELS: Record<string, string> = {
  "IP ADDRESS": "EXPOSTO",
  "GEOLOCATION": "IDENTIFICADO",
  "ISP / OPERADORA": "EXPOSTO",
  "SISTEMA OPERACIONAL": "IDENTIFICADO",
  "GPU / PLACA DE VIDEO": "CAPTURADO",
  "AUDIO FINGERPRINT": "HASH UNICO",
  "CANVAS FINGERPRINT": "GERADO",
  "WEBRTC LOCAL IP": "VAZADO",
  "STATUS DA BATERIA": "LEGIVEL",
  "DISPOSITIVOS DE MIDIA": "ENUMERADOS",
  "FONTES INSTALADAS": "DETECTADAS",
  "DEVICE FINGERPRINT": "CRIADO",
};

const INIT_LINES = [
  { text: "[  OK  ] Modulo scanner carregado", color: "#8B949E" as const },
  { text: "[  OK  ] Sonda WebRTC ativa", color: "#8B949E" as const },
  { text: "[ WARN ] Header DNT ignorado por 94% dos trackers", color: "#F0A500" as const },
];

export function ScannerScreen({ onComplete, isDataReady, deviceHash }: Props) {
  const [progress, setProgress] = useState(0);
  const [initLines, setInitLines] = useState<typeof INIT_LINES>([]);
  const [visibleScans, setVisibleScans] = useState<number[]>([]);
  const [showHash, setShowHash] = useState(false);
  const [hashDisplay, setHashDisplay] = useState("GERANDO...");
  const [showCTA, setShowCTA] = useState(false);
  const [typed, setTyped] = useState("");
  const cmd = "> sudo ./scan --device --network --fingerprint --deep";
  const typingRef = useRef(false);

  // Typewriter for command
  useEffect(() => {
    if (typingRef.current) return;
    typingRef.current = true;
    let i = 0;
    const interval = setInterval(() => {
      if (i < cmd.length) {
        setTyped(cmd.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Init lines appear
  useEffect(() => {
    INIT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setInitLines(prev => [...prev, line]);
      }, 900 + i * 300);
    });
  }, []);

  // Progress bar
  useEffect(() => {
    const start = Date.now();
    const duration = 5500;
    const raf = () => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(Math.round(p));
      if (p < 100) requestAnimationFrame(raf);
    };
    const tid = setTimeout(() => requestAnimationFrame(raf), 1800);
    return () => clearTimeout(tid);
  }, []);

  // Scan lines appear
  useEffect(() => {
    SCAN_LINES.forEach((_, i) => {
      setTimeout(() => {
        setVisibleScans(prev => [...prev, i]);
      }, 2200 + SCAN_LINES[i].delay);
    });
  }, []);

  // Hash + CTA
  useEffect(() => {
    const t1 = setTimeout(() => setShowHash(true), 7200);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (showHash && isDataReady && deviceHash) {
      const t = setTimeout(() => {
        setHashDisplay(deviceHash);
        setTimeout(() => setShowCTA(true), 800);
      }, 600);
      return () => clearTimeout(t);
    } else if (showHash && !isDataReady) {
      const t = setTimeout(() => setShowCTA(true), 2000);
      return () => clearTimeout(t);
    }
  }, [showHash, isDataReady, deviceHash]);

  const fillGrad = `linear-gradient(90deg, #00FF41, #58A6FF)`;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 16px 60px",
        fontFamily: MONO,
        position: "relative",
        zIndex: 1,
      }}
    >
      <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 3, marginBottom: 24, textAlign: "center" }}>
        // INICIALIZANDO PROTOCOLO DE AVALIACAO DE AMEACAS
      </p>

      {/* Terminal Block */}
      <div
        style={{
          width: "min(680px, 92vw)",
          background: "#0D1117",
          border: "1px solid #21262D",
          borderRadius: 4,
          boxShadow: "0 0 0 1px #00FF4110, 0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            height: 32,
            background: "#161B22",
            borderBottom: "1px solid #21262D",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 6,
            borderRadius: "4px 4px 0 0",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57", display: "block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E", display: "block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840", display: "block" }} />
          <span style={{ flex: 1, textAlign: "center", color: "#484F58", fontSize: "0.65rem" }}>
            digital_exposure_v1.0 — /dev/scanner
          </span>
        </div>

        {/* Terminal body */}
        <div style={{ padding: "20px 24px", minHeight: 360 }}>
          {/* Command line */}
          <p style={{ color: "#00FF41", fontSize: "0.8rem", marginBottom: 16, lineHeight: 1.5 }}>
            {typed}
            {typed.length < cmd.length && (
              <span style={{ animation: "blink 800ms infinite" }}>▊</span>
            )}
          </p>

          {/* Init lines */}
          {initLines.map((line, i) => (
            <p key={i} style={{ color: line.color, fontSize: "0.78rem", marginBottom: 6, lineHeight: 1.5 }}>
              {line.text}
            </p>
          ))}

          {/* Progress bar */}
          {initLines.length >= 3 && (
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#00FF41", fontSize: "0.65rem", letterSpacing: 2 }}>ANALISANDO DISPOSITIVO...</span>
                <span style={{ color: "#00FF41", fontSize: "0.65rem" }}>{progress}%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "#161B22", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: fillGrad,
                    borderRadius: 3,
                    transition: "width 0.1s linear",
                    boxShadow: progress > 10 ? "0 0 8px #00FF4160" : "none",
                  }}
                />
              </div>
            </div>
          )}

          {/* Scan lines */}
          <div style={{ marginBottom: 16 }}>
            {SCAN_LINES.map((line, i) => (
              visibleScans.includes(i) ? (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                    animation: "slideRight 0.25s ease",
                  }}
                >
                  <span style={{ color: "#8B949E", fontSize: "0.75rem" }}>
                    ✓ {line.label}
                    <span style={{ color: "#21262D" }}>
                      {" " + "·".repeat(Math.max(2, 28 - line.label.length))}
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      padding: "1px 7px",
                      borderRadius: 2,
                      border: `1px solid ${line.badge === "red" ? "#FF2D2D" : "#F0A500"}`,
                      background: line.badge === "red" ? "rgba(255,45,45,0.15)" : "rgba(240,165,0,0.15)",
                      color: line.badge === "red" ? "#FF2D2D" : "#F0A500",
                      letterSpacing: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {BADGE_LABELS[line.label]}
                  </span>
                </div>
              ) : null
            ))}
          </div>

          {/* Hash display */}
          {showHash && (
            <div style={{ marginTop: 16, animation: "slideUp 0.4s ease" }}>
              <span style={{ color: "#8B949E", fontSize: "0.78rem" }}>» FINGERPRINT_ID: </span>
              <span
                style={{
                  color: "#58A6FF",
                  fontSize: hashDisplay === "GERANDO..." ? "0.78rem" : "0.8rem",
                  letterSpacing: 2,
                  textShadow: hashDisplay !== "GERANDO..." ? "0 0 10px #58A6FF60" : "none",
                  fontFamily: ORBITRON,
                  transition: "all 0.3s",
                }}
              >
                {hashDisplay}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {showCTA && (
        <div style={{ marginTop: 32, textAlign: "center", animation: "slideUp 0.5s ease" }}>
          <button
            onClick={onComplete}
            style={{
              padding: "14px 40px",
              background: "transparent",
              border: "1px solid #00FF41",
              borderRadius: 4,
              color: "#00FF41",
              fontFamily: MONO,
              fontSize: "0.8rem",
              letterSpacing: 3,
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
            VER RELATORIO COMPLETO DE EXPOSICAO &nbsp;→
          </button>
          <p style={{ color: "#484F58", fontSize: "0.65rem", marginTop: 12 }}>
            ⚠ Nenhum dado sai do seu navegador. Todo processamento é local.
          </p>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }
      `}</style>
    </div>
  );
}
