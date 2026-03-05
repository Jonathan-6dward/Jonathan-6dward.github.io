import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";
import { ConsentScreen } from "./ConsentScreen";
import { ScannerScreen } from "./ScannerScreen";
import { DashboardScreen } from "./DashboardScreen";
import { AttackSimulator } from "./AttackSimulator";
import {
  fetchQuickData,
  collectAllData,
  type CollectedData,
} from "../../utils/dataCollector";

const MONO = "'Share Tech Mono', 'Fira Code', monospace";

type QuickData = Awaited<ReturnType<typeof fetchQuickData>>;

interface Props {
  onClose: () => void;
}

const STEPS = ["CONSENTIMENTO", "SCAN", "EXPOSIÇÃO", "SIMULAÇÃO"];

export function ExposureOverlay({ onClose }: Props) {
  const [step, setStep] = useState(0); // 0=consent, 1=scanner, 2=dashboard, 3=attack
  const [quickData, setQuickData] = useState<QuickData | null>(null);
  const [quickLoading, setQuickLoading] = useState(true);
  const [fullData, setFullData] = useState<CollectedData | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const collectRef = useRef(false);

  // Fetch quick IP/geo data immediately for consent screen
  useEffect(() => {
    fetchQuickData()
      .then(d => { setQuickData(d); setQuickLoading(false); })
      .catch(() => setQuickLoading(false));
  }, []);

  // Start full collection when entering scanner screen
  useEffect(() => {
    if (step === 1 && !collectRef.current) {
      collectRef.current = true;
      collectAllData(undefined, quickData ?? undefined)
        .then(data => {
          setFullData(data);
          setIsDataReady(true);
        })
        .catch(() => setIsDataReady(true));
    }
  }, [step, quickData]);

  const handleAccept = () => setStep(1);
  const handleDecline = () => onClose();
  const handleScanComplete = () => setStep(2);
  const handleGoAttack = () => setStep(3);
  const handleBackToDashboard = () => setStep(2);

  // Scanlines overlay style
  const scanlinesStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
  };

  const vignetteStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#080B0F",
        zIndex: 1000,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Animated particle background */}
      <ParticleCanvas />
      {/* Scanlines */}
      <div style={scanlinesStyle} />
      {/* Vignette */}
      <div style={vignetteStyle} />

      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          background: "rgba(8,11,15,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #21262D",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 100,
          fontFamily: MONO,
        }}
      >
        <span
          style={{
            color: "#00FF41",
            fontSize: "0.78rem",
            letterSpacing: 4,
            animation: "flicker 8s infinite",
          }}
        >
          ▸ DIGITAL_EXPOSURE
        </span>

        {/* Step indicator */}
        <span style={{ color: "#484F58", fontSize: "0.65rem", letterSpacing: 2 }}>
          {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          &nbsp;&nbsp;
          <span style={{ color: "#8B949E" }}>{STEPS[step]}</span>
        </span>

        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#484F58",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            transition: "color 120ms ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#E6EDF3"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#484F58"; }}
          title="Fechar"
        >
          <X size={18} />
        </button>
      </header>

      {/* Main content */}
      <main style={{ position: "relative", zIndex: 1 }}>
        {step === 0 && (
          <ConsentScreen
            quickData={quickData}
            loading={quickLoading}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        )}
        {step === 1 && (
          <ScannerScreen
            onComplete={handleScanComplete}
            isDataReady={isDataReady}
            deviceHash={fullData?.device_hash ?? ""}
          />
        )}
        {step === 2 && fullData && (
          <DashboardScreen data={fullData} onNext={handleGoAttack} />
        )}
        {step === 2 && !fullData && (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              color: "#484F58",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ animation: "spin 1s linear infinite", fontSize: "1.5rem" }}>◈</div>
            <p style={{ fontSize: "0.78rem", letterSpacing: 2 }}>CARREGANDO DADOS...</p>
          </div>
        )}
        {step === 3 && <AttackSimulator onBack={handleBackToDashboard} />}
      </main>

      {/* Step navigation dots */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          zIndex: 100,
        }}
      >
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 20 : 8,
              height: 8,
              borderRadius: 100,
              background: i < step ? "#00FF41" : i === step ? "#00FF41" : "#21262D",
              border: i === step ? "none" : `1px solid ${i < step ? "#00FF41" : "#21262D"}`,
              position: "relative",
              transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {i === step && (
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: 100,
                  border: "1px solid #00FF41",
                  animation: "pulseRing 1.5s infinite",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes flicker {
          0%,100% { opacity:1 }
          92% { opacity:1 } 93% { opacity:0.6 } 95% { opacity:1 } 97% { opacity:0.8 }
        }
        @keyframes pulseRing {
          0% { transform:scale(1); opacity:0.8 }
          100% { transform:scale(2.2); opacity:0 }
        }
        @keyframes spin {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        }
        /* Custom scrollbar for overlay */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0D1117; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,65,0.4); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,255,65,0.8); }
        input::placeholder { color: #484F58 !important; }
      `}</style>
    </div>
  );
}
