import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { config_data, readConfig } from "./src/modules/config/config";

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
  if (config_data.MAINTANCE) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <div className="flex flex-col space-y-4">
                <h1>Wartungen</h1>
                <p>Das System ist momentan nicht verfügbar, da Wartungsarbeiten durchgeführt werden.</p>
                <p>Bitte versuche es später erneut!</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
