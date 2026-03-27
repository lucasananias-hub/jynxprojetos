import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpFlow — Controle de Projetos",
  description: "Sistema de gestão operacional com kanban, rastreabilidade e IA generativa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[var(--bg-primary)]">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

function Sidebar() {
  const links = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/kanban", label: "Kanban da Sprint", icon: "📋" },
    { href: "/import/daily", label: "Importar Daily", icon: "🎙️" },
    { href: "/import/spreadsheet", label: "Importar Planilha", icon: "📄" },
    { href: "/history", label: "Histórico", icon: "🕐" },
    { href: "/clients", label: "Clientes", icon: "🏢" },
    { href: "/projects", label: "Projetos", icon: "📁" },
  ];

  return (
    <aside className="w-60 bg-white border-r border-[var(--border)] flex flex-col">
      <div className="p-5 border-b border-[var(--border)]">
        <h1 className="text-xl font-bold text-[var(--accent)]">OpFlow</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Gestão Operacional</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-gray-100 transition-colors"
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
