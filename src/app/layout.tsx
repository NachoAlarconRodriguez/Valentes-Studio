import type { Metadata } from "next";
import { Cinzel, Inter, Cormorant_Garamond } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jefferson Lopes",
  description: "Un refugio exclusivo de rejuvenecimiento y diseño de imagen. Experimenta rituales tradicionales de barbería, peluquería de autor y terapias holísticas de relajación en una atmósfera inmersiva de calma absoluta.",
  keywords: ["santuario de bienestar", "barberia de lujo", "peluqueria de autor", "masajes relajantes", "terapias holísticas", "reiki", "experiencia zen", "corte de cabello"],
};

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  let faviconPath = "/favicon-jefferson.svg"; // default
  if (host.includes("valentes.cl")) {
    faviconPath = "/favicon-valentes.svg";
  } else if (host.includes("almabela.cl")) {
    faviconPath = "/favicon-almabela.svg";
  }

  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href={faviconPath} />
      </head>
      <body className="min-h-full flex flex-col font-sans text-text-primary">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
