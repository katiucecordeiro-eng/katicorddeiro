import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, Patrick_Hand, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const atlasSerif = Cormorant_Garamond({
  variable: "--font-atlas-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const atlasSans = Source_Sans_3({
  variable: "--font-atlas-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const atlasHand = Caveat({
  variable: "--font-atlas-hand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const atlasHandNote = Patrick_Hand({
  variable: "--font-atlas-hand-note",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Asterik — Caderno de Estudo de Anatomia",
  description:
    "Onde estudar anatomia vira arte. Cadernos ilustrados de anatomia para imprimir, colorir e memorizar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${atlasSerif.variable} ${atlasSans.variable} ${atlasHand.variable} ${atlasHandNote.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
