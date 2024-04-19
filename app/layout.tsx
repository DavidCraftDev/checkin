import type { Metadata } from "next"
import "./globals.css";

export const metadata: Metadata = {
  title: "CheckIN System",
  description: "CheckIN System zur Anwesendheitskontrolle von Schülern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
