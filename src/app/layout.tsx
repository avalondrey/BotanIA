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
  title: "ðŸŒ± Jardin Culture â€” Jeu de Cartes Botanique",
  description: "Cultivez votre jardin virtuel dans ce jeu de cartes botanique ! Plantez, arrosez, protÃ©gez vos cultures et crÃ©ez des combos pour maximiser votre rÃ©colte. MÃ©tÃ©o dynamique, maladies et saisons vous attendent.",
  keywords: ["jardin", "jeu de cartes", "botanique", "cultivation", "simulation", "plantes", "manga", "jeu"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ðŸŒ± Jardin Culture â€” Jeu de Cartes Botanique",
    description: "Cultivez votre jardin virtuel dans ce jeu de cartes botanique ! Plantez, arrosez, protÃ©gez vos cultures et crÃ©ez des combos pour maximiser votre rÃ©colte.",
    url: "https://chat.z.ai",
    siteName: "Jardin Culture",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "ðŸŒ± Jardin Culture â€” Jeu de Cartes Botanique",
    description: "Cultivez votre jardin virtuel dans ce jeu de cartes botanique ! Plantez, arrosez, protÃ©gez vos cultures.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning={true} className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

