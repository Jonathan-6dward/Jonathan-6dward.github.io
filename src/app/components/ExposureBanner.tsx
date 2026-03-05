import { Zap } from "lucide-react";

const MONO = "'Share Tech Mono', 'Fira Code', monospace";
const ORBITRON = "'Orbitron', sans-serif";

interface Props {
  onLaunch: () => void;
}

export function ExposureBanner({ onLaunch }: Props) {
  return (
    <section
      id="exposure"
      style={{
        background: "#080B0F",
        padding: "80px 16px",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid #21262D",
        borderBottom: "1px solid #21262D",
      }}
    >
      {/* Animated grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(#00FF41 1px, transparent 1px), linear-gradient(90deg, #00FF41 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      {/* Red glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 300,
          background: "radial-gradient(ellipse, rgba(255,45,45,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          fontFamily: MONO,
        }}
      >
        <p style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 4, marginBottom: 20 }}>
          // projeto_destaque — digital_exposure_v1.0
        </p>

        <h2
          style={{
            fontFamily: ORBITRON,
            fontSize: "clamp(1.6rem, 5vw, 2.8rem)",
            fontWeight: 900,
            color: "#FF2D2D",
            letterSpacing: 4,
            marginBottom: 20,
            textShadow: "0 0 30px #FF2D2D40",
            lineHeight: 1.1,
          }}
        >
          DIGITAL EXPOSURE
        </h2>

        <p style={{ color: "#8B949E", fontSize: "0.85rem", lineHeight: 1.8, marginBottom: 32, maxWidth: 560, margin: "0 auto 32px" }}>
          Uma experiência interativa que demonstra — em tempo real — quantos dados seu
          navegador expõe <strong style={{ color: "#E6EDF3" }}>sem você perceber</strong>.
          IP, localização, GPU, impressão digital do dispositivo, IP local via WebRTC e muito mais.
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {[
            "🌐 IP Geolocation",
            "📡 WebRTC Leak",
            "🎨 Canvas Fingerprint",
            "🎮 WebGL / GPU",
            "🔊 Audio Fingerprint",
            "🔋 Battery API",
            "📷 Media Devices",
            "🔤 Font Detection",
          ].map((tag) => (
            <span
              key={tag}
              style={{
                padding: "4px 12px",
                border: "1px solid #21262D",
                borderRadius: 100,
                color: "#8B949E",
                fontSize: "0.7rem",
                fontFamily: MONO,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={onLaunch}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 40px",
            background: "transparent",
            border: "1px solid #FF2D2D",
            borderRadius: 4,
            color: "#FF2D2D",
            fontFamily: MONO,
            fontSize: "0.85rem",
            letterSpacing: 3,
            cursor: "pointer",
            transition: "all 220ms ease",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.background = "#FF2D2D";
            el.style.color = "#080B0F";
            el.style.boxShadow = "0 0 12px #FF2D2D55, 0 0 40px #FF2D2D20";
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
          <Zap size={18} />
          INICIAR EXPERIÊNCIA
        </button>

        <p style={{ color: "#484F58", fontSize: "0.65rem", marginTop: 14, letterSpacing: 1 }}>
          ⚠ Nenhum dado é enviado a servidores. Tudo processado localmente no seu browser.
        </p>
      </div>
    </section>
  );
}
