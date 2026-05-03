import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  icons: {
    icon: '/isologo.png',
    apple: '/isologo.png',
  },
  title: "Mooseeka - La red profesional de la música",
  description: "Plataforma para que profesionales de la industria musical puedan conectar, vender servicios y mostrar sus trabajos.",
  openGraph: {
    title: "Mooseeka - La red profesional de la música",
    description: "Plataforma para que profesionales de la industria musical puedan conectar, vender servicios y mostrar sus trabajos.",
    url: "https://app.mooseeka.com",
    siteName: "Mooseeka",
    images: [{ url: "https://app.mooseeka.com/logo.png", width: 1200, height: 630, alt: "Mooseeka" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mooseeka - La red profesional de la música",
    description: "Plataforma para que profesionales de la industria musical puedan conectar, vender servicios y mostrar sus trabajos.",
    images: ["https://app.mooseeka.com/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] overflow-x-hidden">{children}</body>
    </html>
  );
}
