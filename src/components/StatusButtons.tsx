import type { StatusCode } from "../lib/audit-storage";
import { cn } from "../lib/utils";

const OPTIONS: { value: StatusCode; label: string }[] = [
  { value: "OK", label: "In Conformance" },
  { value: "VAR", label: "Variations Noted" },
  { value: "NA", label: "Not Applicable" },
  { value: "NR", label: "Not Reviewed" },
];

const ACTIVE_STYLES: Record<StatusCode, string> = {
  OK: "border-emerald-600 bg-emerald-600 text-white",
  VAR: "border-red-600 bg-red-600 text-white",
  NA: "border-slate-500 bg-slate-500 text-white",
  NR: "border-amber-500 bg-amber-500 text-white",
};

export function StatusButtons({
  value,
  onChange,
}: {
  value: StatusCode | "";
  onChange: (value: StatusCode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
            value === option.value
              ? ACTIVE_STYLES[option.value]
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
