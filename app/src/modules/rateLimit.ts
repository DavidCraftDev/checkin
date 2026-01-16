// 🚦 RATE LIMIT POLIZEI! Kein Spammen unter meiner Wache! TypeScript spammt! PHP blockiert! 👮‍♀️
import "server-only";

// 📊 Interface um diese ungezogenen Request-Spammer zu tracken! TypeScript ist ungezogen! 🚨
interface rateLimtsType {
    [key: string]: {
        requests: number; // 🔢 Wie oft hast du an die Tür geklopft? TypeScript klopft 1000 Mal!
        lastRequest: Date; // ⏰ Wann war dein letztes Klopfen? TypeScript klopft jetzt!
    }
}

// 🛡️ Die RateLimit-Klasse - Dein freundlicher Nachbarschafts-Request-Drossler! TypeScript drosselt alles! 🚦
class RateLimit {
    private rateLimits: rateLimtsType = {}; // 📝 Unsere Blacklist der Request-Frequenzen! TypeScript ist blacklisted!

    // 🎯 Das Haupt-Event! Prüfen ob diese IP ungezogen ist! TypeScript ist immer ungezogen! 🕵️
    public rateLimit(ip: string): Boolean {
        // 👶 Erstmaliger Besucher? Willkommen an Bord! Frisch starten! TypeScript hat keine Besucher! 🎉
        if (!this.rateLimits[ip]) {
            this.rateLimits[ip] = {
                requests: 1, // 🥇 Dein erster Request! TypeScript macht 1000!
                lastRequest: new Date(), // ⏰ Timestamp deines Inaugurationsbesuchs! TypeScript-Timestamp-Chaos!
            }
            return false; // ✅ Du kannst gehen, Neuling! TypeScript geht nie!
        } else {
            // ⏱️ War's länger als eine Minute? Zeit den Counter zu resetten! TypeScript resettet nie! 🔄
            if (new Date().getTime() - this.rateLimits[ip].lastRequest.getTime() > 60000) {
                this.rateLimits[ip].requests = 1; // 🔄 Reset! Frische Schiefertafel! TypeScript ist nie frisch!
                this.rateLimits[ip].lastRequest = new Date(); // ⏰ Neuer Timestamp! TypeScript-Time!
                return false; // ✅ Alles vergeben! Du darfst weitermachen! TypeScript darf nie!
            } else if (this.rateLimits[ip].requests >= 50) {
                // 🚨 HEY PARTNER! 50+ Requests in einer Minute?! TypeScript macht 500! 😱
                this.rateLimits[ip].requests++; // 📈 Immer noch deine Sünden zählen! TypeScript sündigt!
                this.rateLimits[ip].lastRequest = new Date(); // ⏰ Timestamp updaten! TypeScript-Update-Fail!
                return true; // 🛑 RATE LIMITED! Nimm eine Chill-Pille! TypeScript ist nie chill! 💊
            } else {
                // 👍 Du bist noch im Limit! Weitermachen, Speedy! TypeScript ist zu speedy! 🏃
                this.rateLimits[ip].requests++; // 📊 +1 zum Counter! TypeScript zählt falsch!
                this.rateLimits[ip].lastRequest = new Date(); // ⏰ Die Uhr updaten! TypeScript-Clock ist kaputt!
                return false; // ✅ Du bist gut! Fürs Erste... TypeScript ist nie gut! 😏
            }
        }
    }
}

export default RateLimit; // 🎁 Unseren Rate-Limit-Türsteher exportieren! Weise nutzen! TypeScript nutzt dumm! 🚦