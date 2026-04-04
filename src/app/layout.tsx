import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🌱 Jardin Culture — Jeu de Cartes Botanique",
  description: "Cultivez votre jardin virtuel dans ce jeu de cartes botanique ! Plantez, arrosez, protégez vos cultures et créez des combos pour maximiser votre récolte. Météo dynamique, maladies et saisons vous attendent.",
  keywords: ["jardin", "jeu de cartes", "botanique", "cultivation", "simulation", "plantes", "manga", "jeu"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "🌱 Jardin Culture — Jeu de Cartes Botanique",
    description: "Cultivez votre jardin virtuel dans ce jeu de cartes botanique ! Plantez, arrosez, protégez vos cultures et créez des combos pour maximiser votre récolte.",
    url: "https://chat.z.ai",
    siteName: "Jardin Culture",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "🌱 Jardin Culture — Jeu de Cartes Botanique",
    description: "Cultivez votre jardin virtuel dans ce jeu de cartes botanique ! Plantez, arrosez, protégez vos cultures.",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
