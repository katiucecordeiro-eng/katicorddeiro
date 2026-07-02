import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Asterik — Caderno de Estudo de Anatomia",
  description:
    "Estude anatomia colorindo pranchas estilo atlas científico, com anotações, quizzes e Pomodoro integrado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${atlasSerif.variable} ${atlasSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
