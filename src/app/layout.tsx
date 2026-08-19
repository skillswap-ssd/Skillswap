import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { SkillSwapProvider } from "@/lib/context/skillswap-context";

export const metadata: Metadata = {
  title: "SkillSwap — Exchange skills",
  description: "Exchange skills. Learn from people. Grow together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain">
        <SkillSwapProvider>
          <AppShell>{children}</AppShell>
        </SkillSwapProvider>
      </body>
    </html>
  );
}
