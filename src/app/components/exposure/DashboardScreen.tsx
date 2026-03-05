import { useEffect, useRef, useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import type { CollectedData } from "../../utils/dataCollector";

const MONO = "'Share Tech Mono', 'Fira Code', monospace";
const ORBITRON = "'Orbitron', sans-serif";

interface Props {
  data: CollectedData;
  onNext: () => void;
}

function val(v: unknown): string {
  if (v === undefined || v === null || v === "unavailable" || v === false) return "— unavailable";
  if (Array.isArray(v)) return v.length === 0 ? "— unavailable" : v.join(", ");
  if (typeof v === "boolean") return v ? "YES" : "NO";
  return String(v);
}

function DataRow({ label, value, alarming = false }: { label: string; value: unknown; alarming?: boolean }) {
  const display = val(value);
  const isUnavail = display === "— unavailable";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "6px 0",
        borderBottom: "1px solid #161B22",
        fontFamily: MONO,
      }}
    >
      <span style={{ color: "#484F58", fontSize: "0.72rem", wordBreak: "break-all", flex: "0 0 auto", maxWidth: "45%" }}>
        {label}
      </span>
      <span
        style={{
          color: isUnavail ? "#484F58" : alarming ? "#FF2D2D" : "#8B949E",
          fontSize: "0.72rem",
          wordBreak: "break-all",
          textAlign: "right",
        }}
      >
        {display}
      </span>
    </div>
  );
}

interface AccordionSection {
  emoji: string;
  label: string;
  count: number;
  rows: { label: string; value: unknown; alarming?: boolean }[];
}

function Accordion({ section }: { section: AccordionSection }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: "#0D1117",
        border: "1px solid #21262D",
        borderRadius: 4,
        marginBottom: 8,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: MONO,
          transition: "background 120ms ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#161B22"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1rem" }}>{section.emoji}</span>
          <span style={{ color: "#E6EDF3", fontSize: "0.82rem" }}>{section.label}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              background: "rgba(0,255,65,0.1)",
              border: "1px solid rgba(0,255,65,0.3)",
              color: "#00FF41",
              fontSize: "0.65rem",
              padding: "2px 10px",
              borderRadius: 100,
            }}
          >
            {section.count} pontos
          </span>
          <ChevronDown
            size={16}
            color="#484F58"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 220ms ease" }}
          />
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 18px 14px",
            borderTop: "1px solid #21262D",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "0 24px",
          }}
        >
          {section.rows.map((row, i) => (
            <DataRow key={i} label={row.label} value={row.value} alarming={row.alarming} />
          ))}
        </div>
      )}
    </div>
  );
}

// SVG Gauge
function ScoreGauge({ score, color }: { score: number; color: "red" | "amber" | "green" }) {
  const gaugeRef = useRef<SVGCircleElement>(null);
  const [animated, setAnimated] = useState(false);
  const size = typeof window !== "undefined" && window.innerWidth < 640 ? 160 : 200;
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const colorMap = { red: "#FF2D2D", amber: "#F0A500", green: "#00FF41" };
  const strokeColor = colorMap[color];

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#161B22" strokeWidth={12}
      />
      {/* Progress */}
      <circle
        ref={gaugeRef}
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={animated ? circ - fill : circ}
        style={{
          transition: "stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)",
          filter: `drop-shadow(0 0 6px ${strokeColor}80)`,
        }}
      />
    </svg>
  );
}

export function DashboardScreen({ data, onNext }: Props) {
  const [copied, setCopied] = useState(false);
  const scoreColor = data.exposure?.color ?? "red";
  const score = data.exposure?.score ?? 0;

  const scoreColorMap: Record<string, string> = { red: "#FF2D2D", amber: "#F0A500", green: "#00FF41" };
  const scoreHex = scoreColorMap[scoreColor];

  const sections: AccordionSection[] = [
    {
      emoji: "🌐", label: "REDE", count: 10,
      rows: [
        { label: "ip_público", value: data.ip, alarming: true },
        { label: "ip_local_webrtc", value: data.local_ip, alarming: true },
        { label: "isp_operadora", value: data.isp, alarming: true },
        { label: "asn", value: data.asn },
        { label: "pais", value: data.country },
        { label: "regiao", value: data.region },
        { label: "cidade_aprox", value: data.city, alarming: true },
        { label: "tipo_conexao", value: data.connection_type },
        { label: "velocidade_mbps", value: data.downlink_mbps },
        { label: "latencia_rtt_ms", value: data.rtt_ms },
      ],
    },
    {
      emoji: "💻", label: "SISTEMA", count: 7,
      rows: [
        { label: "plataforma", value: data.os_raw },
        { label: "tipo_dispositivo", value: data.device_type },
        { label: "nucleos_cpu", value: data.cpu_cores, alarming: true },
        { label: "ram_estimada_gb", value: data.ram_gb, alarming: true },
        { label: "touch_points", value: data.touch_points },
        { label: "tipo_ponteiro", value: data.pointer_type },
        { label: "fuso_horario", value: data.timezone },
      ],
    },
    {
      emoji: "🌍", label: "NAVEGADOR", count: 9,
      rows: [
        { label: "navegador", value: `${data.browser_name} ${data.browser_version}` },
        { label: "vendor", value: data.browser_vendor },
        { label: "idioma_primario", value: data.language },
        { label: "idiomas", value: data.languages },
        { label: "do_not_track", value: data.do_not_track },
        { label: "cookies_ativados", value: data.cookies_enabled },
        { label: "webassembly", value: data.webassembly },
        { label: "service_workers", value: data.service_workers },
        { label: "user_agent", value: data.user_agent },
      ],
    },
    {
      emoji: "🖥️", label: "DISPLAY", count: 6,
      rows: [
        { label: "resolucao_tela", value: `${data.screen_width}×${data.screen_height}` },
        { label: "viewport", value: `${data.viewport_width}×${data.viewport_height}` },
        { label: "pixel_ratio", value: data.pixel_ratio },
        { label: "profundidade_cor", value: data.color_depth },
        { label: "orientacao", value: data.orientation },
        { label: "datetime_local", value: data.local_datetime },
      ],
    },
    {
      emoji: "🎮", label: "HARDWARE / GPU", count: 4,
      rows: [
        { label: "gpu_renderer", value: data.gpu_renderer, alarming: true },
        { label: "gpu_vendor", value: data.gpu_vendor },
        { label: "webgl_versao", value: "WebGL 1.0" },
        { label: "webgl2_suportado", value: typeof document !== "undefined" ? !!document.createElement("canvas").getContext("webgl2") : false },
      ],
    },
    {
      emoji: "🎨", label: "FINGERPRINTS", count: 4,
      rows: [
        { label: "canvas_hash", value: data.canvas_hash, alarming: true },
        { label: "webgl_hash", value: data.webgl_hash, alarming: true },
        { label: "audio_hash", value: data.audio_hash, alarming: true },
        { label: "fontes_detectadas", value: data.fonts_detected?.length > 0 ? `${data.fonts_detected.length} fontes` : "0", alarming: true },
      ],
    },
    {
      emoji: "🔋", label: "STATUS DO DISPOSITIVO", count: 3,
      rows: [
        { label: "nivel_bateria", value: data.battery_level },
        { label: "carregando", value: data.charging_status },
        { label: "tempo_para_carga", value: data.time_to_full },
      ],
    },
    {
      emoji: "📷", label: "DISPOSITIVOS DE MIDIA", count: 3,
      rows: [
        { label: "cameras", value: data.cameras, alarming: true },
        { label: "microfones", value: data.microphones, alarming: true },
        { label: "alto_falantes", value: data.speakers },
      ],
    },
    {
      emoji: "📡", label: "SENSORES", count: 3,
      rows: [
        { label: "acelerometro", value: data.accelerometer },
        { label: "giroscopio", value: data.gyroscope },
        { label: "touch_points_max", value: data.touch_points },
      ],
    },
    {
      emoji: "📂", label: "ARMAZENAMENTO", count: 4,
      rows: [
        { label: "localStorage", value: data.localstorage },
        { label: "sessionStorage", value: data.sessionstorage },
        { label: "indexedDB", value: data.indexeddb },
        { label: "cache_api", value: data.cache_api },
      ],
    },
    {
      emoji: "🔐", label: "SEGURANÇA", count: 3,
      rows: [
        { label: "https_ativo", value: data.https_active },
        { label: "webrtc_ativo", value: data.webrtc_active },
        { label: "cookies", value: data.cookies_enabled },
      ],
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.device_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Alert Banner */}
        <div
          style={{
            background: "rgba(255,45,45,0.08)",
            border: "1px solid rgba(255,45,45,0.3)",
            borderLeft: "4px solid #FF2D2D",
            borderRadius: 4,
            padding: "16px 20px",
            marginBottom: 48,
            animation: "slideDown 0.5s ease",
          }}
        >
          <p style={{ color: "#FF2D2D", fontSize: "0.85rem", letterSpacing: 1, marginBottom: 4 }}>
            ⚠&nbsp; SEU NAVEGADOR EXPÔS {data.exposure?.data_points_count ?? 60}+ PONTOS DE DADOS A ESTA PÁGINA
          </p>
          <p style={{ color: "#8B949E", fontSize: "0.75rem" }}>
            Um tracker real já teria construído o seu perfil completo.
          </p>
        </div>

        {/* Score Section */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
            <ScoreGauge score={score} color={scoreColor} />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: ORBITRON, fontSize: "2.5rem", fontWeight: 900, color: scoreHex, lineHeight: 1 }}>
                {score}
              </div>
              <div style={{ color: "#8B949E", fontSize: "0.75rem" }}>/ 100</div>
            </div>
          </div>
          <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 4, marginBottom: 16 }}>
            SCORE DE EXPOSIÇÃO DIGITAL
          </p>
          <div
            style={{
              display: "inline-block",
              background: `rgba(${scoreColor === "red" ? "255,45,45" : scoreColor === "amber" ? "240,165,0" : "0,255,65"},0.12)`,
              border: `1px solid ${scoreHex}`,
              color: scoreHex,
              fontFamily: MONO,
              fontSize: "0.78rem",
              letterSpacing: 2,
              padding: "8px 20px",
              borderRadius: 100,
            }}
          >
            ● {data.exposure?.label} EXPOSURE RISK
          </div>
        </div>

        {/* Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {[
            {
              emoji: "🎯",
              label: "TRACKING RISK",
              value: data.exposure?.label ?? "HIGH",
              footer: "Único entre 99.7% dos usuários",
              color: "#FF2D2D",
            },
            {
              emoji: "👁",
              label: "BROWSER FINGERPRINT",
              value: "ÚNICO",
              footer: "Identificável sem cookies",
              color: "#FF2D2D",
            },
            {
              emoji: "📡",
              label: "EXPOSIÇÃO DE REDE",
              value: data.local_ip !== "unavailable" ? "VAZADO" : "EXPOSTO",
              footer: `ISP + localização visíveis`,
              color: "#F0A500",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#0D1117",
                border: "1px solid #21262D",
                borderTop: `2px solid ${card.color}`,
                borderRadius: 4,
                padding: 20,
                transition: "all 400ms cubic-bezier(0.16,1,0.3,1)",
                cursor: "default",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.borderColor = `${card.color}60`;
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = `0 0 12px ${card.color}30`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.borderColor = "#21262D";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 3, marginBottom: 8 }}>
                {card.emoji}&nbsp; {card.label}
              </p>
              <p style={{ fontFamily: ORBITRON, fontSize: "1.5rem", fontWeight: 700, color: card.color, marginBottom: 8 }}>
                {card.value}
              </p>
              <p style={{ color: "#484F58", fontSize: "0.72rem" }}>{card.footer}</p>
            </div>
          ))}
        </div>

        {/* Data Categories Accordion */}
        <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 4, marginBottom: 16 }}>
          BREAKDOWN DOS DADOS COLETADOS
        </p>
        {sections.map((section, i) => (
          <Accordion key={i} section={section} />
        ))}

        {/* Fingerprint Hash Display */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 4, marginBottom: 16 }}>
            SUA IMPRESSÃO DIGITAL ÚNICA DO DISPOSITIVO
          </p>
          <div
            style={{
              display: "inline-block",
              background: "#0D1117",
              border: "1px solid rgba(0,255,65,0.3)",
              borderRadius: 4,
              padding: "20px 28px",
              marginBottom: 16,
              animation: "glowPulse 2s infinite",
            }}
          >
            <span
              style={{
                fontFamily: ORBITRON,
                fontSize: "clamp(0.8rem, 2.5vw, 1.2rem)",
                color: "#00FF41",
                letterSpacing: 6,
                wordBreak: "break-all",
              }}
            >
              {data.device_hash}
            </span>
          </div>
          <br />
          <button
            onClick={handleCopy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              background: "transparent",
              border: "1px solid #21262D",
              borderRadius: 4,
              color: copied ? "#00FF41" : "#484F58",
              fontFamily: MONO,
              fontSize: "0.72rem",
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "✓ COPIADO" : "COPIAR HASH"}
          </button>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <button
            onClick={onNext}
            style={{
              padding: "14px 40px",
              background: "transparent",
              border: "1px solid #FF2D2D",
              borderRadius: 4,
              color: "#FF2D2D",
              fontFamily: MONO,
              fontSize: "0.8rem",
              letterSpacing: 3,
              cursor: "pointer",
              transition: "all 220ms ease",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.background = "#FF2D2D";
              el.style.color = "#080B0F";
              el.style.boxShadow = "0 0 12px #FF2D2D55, 0 0 30px #FF2D2D20";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.background = "transparent";
              el.style.color = "#FF2D2D";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }}
          >
            SIMULAR VISÃO DO ATACANTE&nbsp; →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 8px #00FF4130 }
          50% { box-shadow: 0 0 20px #00FF4160, 0 0 40px #00FF4120 }
        }
      `}</style>
    </div>
  );
}
