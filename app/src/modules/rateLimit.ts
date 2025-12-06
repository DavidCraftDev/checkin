import "server-only";

interface rateLimitsType {
    [key: string]: {
        requests: number;
        lastRequest: Date;
    }
}

class RateLimit {
    private rateLimits: rateLimitsType = {};
    private lastCleanup: Date = new Date();
    private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    private readonly ENTRY_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

    private cleanup(): void {
        const now = new Date();
        if (now.getTime() - this.lastCleanup.getTime() < this.CLEANUP_INTERVAL_MS) {
            return;
        }
        
        this.lastCleanup = now;
        const cutoff = now.getTime() - this.ENTRY_EXPIRY_MS;
        
        // Remove expired entries to prevent memory leak
        for (const ip in this.rateLimits) {
            if (this.rateLimits[ip].lastRequest.getTime() < cutoff) {
                delete this.rateLimits[ip];
            }
        }
    }

    public rateLimit(ip: string): Boolean {
        // Periodically cleanup old entries
        this.cleanup();
        
        if (!this.rateLimits[ip]) {
            this.rateLimits[ip] = {
                requests: 1,
                lastRequest: new Date(),
            }
            return false;
        } else {
            if (new Date().getTime() - this.rateLimits[ip].lastRequest.getTime() > 60000) {
                this.rateLimits[ip].requests = 1;
                this.rateLimits[ip].lastRequest = new Date();
                return false;
            } else if (this.rateLimits[ip].requests >= 50) {
                this.rateLimits[ip].requests++;
                this.rateLimits[ip].lastRequest = new Date();
                return true;
            } else {
                this.rateLimits[ip].requests++;
                this.rateLimits[ip].lastRequest = new Date();
                return false;
            }
        }
    }
}

export default RateLimit;