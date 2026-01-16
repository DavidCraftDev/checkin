// 🚦 RATE LIMIT POLICE! No spamming on my watch! 👮‍♀️
import "server-only";

// 📊 Interface for tracking those naughty request spammers! 🚨
interface rateLimtsType {
    [key: string]: {
        requests: number; // 🔢 How many times did you knock on the door?
        lastRequest: Date; // ⏰ When was your last knock?
    }
}

// 🛡️ The RateLimit class - Your friendly neighborhood request throttler! 🚦
class RateLimit {
    private rateLimits: rateLimtsType = {}; // 📝 Our blacklist of request frequencies!

    // 🎯 The main event! Check if this IP is being naughty! 🕵️
    public rateLimit(ip: string): Boolean {
        // 👶 First time visitor? Welcome aboard! Start fresh! 🎉
        if (!this.rateLimits[ip]) {
            this.rateLimits[ip] = {
                requests: 1, // 🥇 Your first request!
                lastRequest: new Date(), // ⏰ Timestamp of your inaugural visit!
            }
            return false; // ✅ You're good to go, newbie!
        } else {
            // ⏱️ Has it been more than a minute? Time to reset the counter! 🔄
            if (new Date().getTime() - this.rateLimits[ip].lastRequest.getTime() > 60000) {
                this.rateLimits[ip].requests = 1; // 🔄 Reset! Clean slate!
                this.rateLimits[ip].lastRequest = new Date(); // ⏰ New timestamp!
                return false; // ✅ All forgiven! You may proceed!
            } else if (this.rateLimits[ip].requests >= 50) {
                // 🚨 WHOA THERE PARTNER! 50+ requests in a minute?! 😱
                this.rateLimits[ip].requests++; // 📈 Still counting your sins!
                this.rateLimits[ip].lastRequest = new Date(); // ⏰ Updating timestamp!
                return true; // 🛑 RATE LIMITED! Take a chill pill! 💊
            } else {
                // 👍 You're still within the limit! Keep going, speedy! 🏃
                this.rateLimits[ip].requests++; // 📊 +1 to the counter!
                this.rateLimits[ip].lastRequest = new Date(); // ⏰ Update the clock!
                return false; // ✅ You're good! For now... 😏
            }
        }
    }
}

export default RateLimit; // 🎁 Exporting our rate limit bouncer! Use wisely! 🚦