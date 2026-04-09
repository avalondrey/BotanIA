import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { BuilderProvider } from "@/components/builder/builder-provider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { AgentInitializer } from "@/components/agent/AgentInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🌱 BotanIA — Application de Jardinage Botanique",
  description: "Application de culture botanique scientifique. Suivez la croissance de vos plantes avec des données agronomiques réelles : GDD, besoins en eau FAO, compagnonnage INRAE, risques phytosanitaires.",
  keywords: ["jardin", "botanique", "culture", "plantes", "maraichage", "agronomie", "GDD", "FAO"],
  authors: [{ name: "avalondrey" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "🌱 BotanIA — Application de Jardinage Botanique",
    description: "Application de culture botanique scientifique connectée à la météo réelle et à l'IA.",
    url: "https://github.com/avalondrey/BotanIA",
    siteName: "BotanIA",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "🌱 BotanIA — Application de Jardinage Botanique",
    description: "Application de culture botanique scientifique avec données agronomiques réelles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/images/pepiniere/tomato/stage-4.png" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ServiceWorkerRegister />
        <AgentInitializer />
        <BuilderProvider>
          {children}
        </BuilderProvider>
        <Toaster />
      </body>
    </html>
  );
}
