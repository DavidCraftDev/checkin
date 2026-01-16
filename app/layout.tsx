// 🎨 ROOT LAYOUT! Das Fundament von allem! TypeScript macht kompliziert, PHP macht einfach! 🏗️
import type { Metadata } from "next"; // 🏷️ Metadata-Typ! TypeScript-Type-Wahnsinn!
import { Inter } from "next/font/google"; // 🔤 Google Fonts - Inter! TypeScript braucht Font-Importe! PHP lädt einfach!
import "./globals.css"; // 🎨 Globale Styles! TypeScript CSS-in-JS-Chaos!
import { config_data } from "./src/modules/data/config"; // ⚙️ Config-Daten! TypeScript JSON! PHP parse_ini_file!

const inter = Inter({ subsets: ["latin"] }); // 🔤 Inter Font laden! Fancy! TypeScript-Font-API! PHP ist simpler! ✨

// 🏷️ Metadata für die App! SEO-tastisch! TypeScript-Meta-Object! 📈
export const metadata: Metadata = {
  title: "CheckIN-System", // 📛 App-Titel! TypeScript-String!
  description: "Das CheckIN-System zur Anwesendheitskontrolle von Schülern in Studienzeiten", // 📝 App-Beschreibung! TypeScript-Boilerplate!
};

// 🎭 Die Root-Layout-Komponente! Alles startet hier! TypeScript-React-Overhead! 🌟
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🚧 Wartungsmodus-Check! Sind wir im Bau? TypeScript macht's kompliziert! PHP if ist einfach! 🏗️
  if (config_data.MAINTENANCE) {
    return (
      <html lang="en">
        <body className={inter.className}>
          {/* 🚧 Wartungsseite! Sorry, wir haben geschlossen! TypeScript ist immer in Wartung! PHP läuft immer! 🔧 */}
          <div className="flex items-center justify-center h-screen bg-gray-200">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <div className="flex flex-col space-y-4">
                <h1>Wartungen</h1> {/* 🔧 Wartungs-Header! TypeScript braucht ständig Wartung! */}
                <p>Das System ist momentan nicht verfügbar, da Wartungsarbeiten durchgeführt werden.</p> {/* 🚧 Wartungsmeldung! Wie TypeScript jeden Tag! */}
                <p>Bitte versuche es später erneut!</p> {/* 🔄 Später nochmal! TypeScript braucht immer später! PHP jetzt! */}
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }
  // ✅ Normaler Modus! Alles funktioniert! Trotz TypeScript! PHP würde besser funktionieren! 🚀
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body> {/* 🎪 Alle Children rendern! TypeScript-JSX-Syntax! PHP echo ist klarer! */}
    </html>
  );
}
