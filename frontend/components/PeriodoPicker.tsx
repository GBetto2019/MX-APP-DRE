"use client";

interface PeriodoPickerProps {
  inicio: string;
  fim: string;
  onInicio: (v: string) => void;
  onFim: (v: string) => void;
}

export default function PeriodoPicker({
  inicio,
  fim,
  onInicio,
  onFim,
}: PeriodoPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm whitespace-nowrap" style={{ color: "#3E3E3E" }}>De</label>
        <input
          type="month"
          value={inicio}
          onChange={(e) => onInicio(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none transition-all bg-white"
          style={{ borderColor: "#E5E5E5", color: "#0C1934" }}
          onFocus={(e) => (e.target.style.borderColor = "#0C1934")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm whitespace-nowrap" style={{ color: "#3E3E3E" }}>Até</label>
        <input
          type="month"
          value={fim}
          onChange={(e) => onFim(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none transition-all bg-white"
          style={{ borderColor: "#E5E5E5", color: "#0C1934" }}
          onFocus={(e) => (e.target.style.borderColor = "#0C1934")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
        />
      </div>
    </div>
  );
}
