import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BotanIA — Dashboard IA',
  description: 'Tableau de bord admin du microservice IA Lia',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e5e5e5]">
      <header className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex items-center gap-4 border-b border-white/10">
        <span className="text-3xl">🤖</span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">BotanIA — Agent IA v2</h1>
          <p className="text-xs opacity-75">Co-pilote proactif & autonome · Ollama + Qdrant</p>
        </div>
      </header>
      <main className="h-[calc(100vh-72px)]">{children}</main>
    </div>
  );
}
