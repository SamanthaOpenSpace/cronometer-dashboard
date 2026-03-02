import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cronometer Dashboard",
  description: "Next.js 14 + Supabase dashboard for nutrition, body, and WHOOP metrics"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
