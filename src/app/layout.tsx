import type { Metadata } from "next";
import { Cinzel, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { headers } from "next/headers";

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
  title: "Jefferson Lopes | Santuario de Bienestar",
  description: "Un refugio exclusivo de rejuvenecimiento y diseño de imagen. Experimenta rituales tradicionales de barbería, peluquería de autor y terapias holísticas de relajación en una atmósfera inmersiva de calma absoluta.",
  keywords: ["santuario de bienestar", "barberia de lujo", "peluqueria de autor", "masajes relajantes", "terapias holísticas", "reiki", "experiencia zen", "corte de cabello"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = (headersList.get("host") || "").toLowerCase();

  let faviconPath = "/favicon-jefferson.svg";
  let canonicalUrl = "https://www.jeffersonlopes.cl";
  let siteTitle = "Jefferson Lopes | Santuario de Bienestar";
  let siteDescription = "Un refugio exclusivo de rejuvenecimiento y diseño de imagen. Barbería tradicional, peluquería de autor y terapias holísticas de relajación.";
  let googleVerificationToken = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_JEFFERSON || "";

  if (host.includes("valentes.cl")) {
    faviconPath = "/favicon-valentes.svg";
    canonicalUrl = "https://www.valentes.cl";
    siteTitle = "Valentes Barber Studio | Barbería Tradicional";
    siteDescription = "Cortes de autor, afeitados con navaja libre y rituales de toallas calientes diseñados para el caballero contemporáneo.";
    googleVerificationToken = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_VALENTES || "";
  } else if (host.includes("almabela.cl")) {
    faviconPath = "/favicon-almabela.svg";
    canonicalUrl = "https://www.almabela.cl";
    siteTitle = "Alma Bela Studio | Peluquería de Autor";
    siteDescription = "Un espacio de empatía, técnica y cuidado donde transformamos vidas. Coloración botánica orgánica, cortes de diseño y nutrición molecular profunda.";
    googleVerificationToken = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_ALMABELA || "";
  }

  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <link rel="icon" href={faviconPath} />
        <link rel="canonical" href={canonicalUrl} />
        {googleVerificationToken && (
          <meta name="google-site-verification" content={googleVerificationToken} />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans text-text-primary">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
