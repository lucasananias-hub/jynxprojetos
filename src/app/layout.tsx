import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { AppShell } from "@/components/AppShell";
import AIAssistant from "@/components/AIAssistant";

export const metadata: Metadata = {
  title: "OpFlow — Controle de Projetos",
  description:
    "Sistema de gestão operacional com kanban, rastreabilidade e IA generativa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[var(--bg-primary)]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <AIAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
