import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://journeytravel.group";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Journey Travel Group — Corporate Travel, Activations & Events",
  description:
    "Journey Travel Group designs the trips, retail activations, and events your customers remember — engineered for business, built for impact.",
  keywords: [
    "corporate travel",
    "retail activations",
    "corporate events",
    "incentive travel",
    "brand activations",
    "Journey Travel Group",
  ],
  authors: [{ name: "Journey Travel Group" }],
  icons: {
    icon: "/assets/plane-ink.png",
    apple: "/assets/plane-ink.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Journey Travel Group",
    title: "Journey Travel Group — Corporate Travel, Activations & Events",
    description:
      "The trips, retail activations, and events your customers remember — engineered for business, built for impact.",
    images: [{ url: "/assets/photo-events.webp", width: 1200, height: 675 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey Travel Group",
    description:
      "Corporate travel, retail activations, and events — engineered for business, built for impact.",
    images: ["/assets/photo-events.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
