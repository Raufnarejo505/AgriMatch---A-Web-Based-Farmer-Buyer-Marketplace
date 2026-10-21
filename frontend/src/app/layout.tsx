import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriMatch",
  description: "Farmer and buyer agricultural marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
