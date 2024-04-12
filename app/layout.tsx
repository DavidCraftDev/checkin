import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CheckIN System",
  description: "CheckIN System zur Anwesendheitskontrolle von Schülern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  throw new Error('Not implemented');
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
