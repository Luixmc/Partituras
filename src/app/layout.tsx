import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Partituras · Centro Cristiano La Casa de mi Padre",
  description: "Gestor de canciones y acordes de Centro Cristiano La Casa de mi Padre",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#191c4d",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        {/* Aplica el tema (oscuro/claro) ANTES de pintar, leyendo la preferencia
            guardada, para evitar el parpadeo inicial. El tamaño de letra (zoom)
            se aplica solo al contenido, no aquí. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=JSON.parse(localStorage.getItem('reading-prefs')||'{}');if(p&&p.dark)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-body antialiased bg-slate-50 text-slate-900 min-h-dvh dark:bg-slate-950 dark:text-slate-100">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
