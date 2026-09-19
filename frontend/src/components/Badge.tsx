import type { ReactNode } from "react";

const tones = {
  green: "bg-green-100 text-green-800",
  gray: "bg-gray-100 text-gray-600",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-800",
} as const;

export type BadgeTone = keyof typeof tones;

export default function Badge({ children, tone = "green" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
  );
}
