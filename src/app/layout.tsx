import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Santuario de Bienestar | Barbería, Peluquería & Terapias Holísticas",
  description: "Un refugio exclusivo de rejuvenecimiento y diseño de imagen. Experimenta rituales tradicionales de barbería, peluquería de autor y terapias holísticas de relajación en una atmósfera inmersiva de calma absoluta.",
  keywords: ["santuario de bienestar", "barberia de lujo", "peluqueria de autor", "masajes relajantes", "terapias holísticas", "reiki", "experiencia zen", "corte de cabello"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-text-primary">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
