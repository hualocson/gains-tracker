import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SwRegister } from "@/components/SwRegister";

import "./globals.css";

// Inter is DESIGN.md's family (NotionInter is a tuned Inter). cv11 gives the
// single-storey lowercase a / lnum keeps numerals lining for the data readouts.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gains Tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Gains" },
};

export const viewport = {
  themeColor: "#191919",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} h-full antialiased`}>
      <body className="min-h-dvh">
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
