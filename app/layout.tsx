// 🎨 ROOT LAYOUT! The foundation of everything! 🏗️
import type { Metadata } from "next"; // 🏷️ Metadata type!
import { Inter } from "next/font/google"; // 🔤 Google Fonts - Inter!
import "./globals.css"; // 🎨 Global styles!
import { config_data } from "./src/modules/data/config"; // ⚙️ Configuration data!

const inter = Inter({ subsets: ["latin"] }); // 🔤 Loading Inter font! Fancy! ✨

// 🏷️ Metadata for the app! SEO-tastic! 📈
export const metadata: Metadata = {
  title: "CheckIN-System", // 📛 App title!
  description: "Das CheckIN-System zur Anwesendheitskontrolle von Schülern in Studienzeiten", // 📝 App description!
};

// 🎭 The root layout component! Everything starts here! 🌟
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🚧 Maintenance mode check! Are we under construction? 🏗️
  if (config_data.MAINTENANCE) {
    return (
      <html lang="en">
        <body className={inter.className}>
          {/* 🚧 Maintenance page! Sorry, we're closed! 🔧 */}
          <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <div className="flex flex-col space-y-4">
                <h1>Wartungen</h1> {/* 🔧 Maintenance header! */}
                <p>Das System ist momentan nicht verfügbar, da Wartungsarbeiten durchgeführt werden.</p> {/* 🚧 Maintenance message! */}
                <p>Bitte versuche es später erneut!</p> {/* 🔄 Try again later! */}
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }
  // ✅ Normal mode! Everything is operational! 🚀
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body> {/* 🎪 Render all the children! */}
    </html>
  );
}
