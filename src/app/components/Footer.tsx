import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 px-4 bg-[#0d1117] border-t border-[#1e2130]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#00ff9d]">
          <Shield size={16} />
          <span className="text-sm font-mono text-[#00ff9d]">Jonathan Edward · SOC N1 | Blue Team</span>
        </div>
        <p className="text-xs font-mono text-[#8892b0]">
          Feito com dedicação ao Blue Team · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}