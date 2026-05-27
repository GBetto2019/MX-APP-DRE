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
        <label className="text-sm text-gray-500 whitespace-nowrap">De</label>
        <input
          type="month"
          value={inicio}
          onChange={(e) => onInicio(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-500 whitespace-nowrap">Até</label>
        <input
          type="month"
          value={fim}
          onChange={(e) => onFim(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
        />
      </div>
    </div>
  );
}
