interface rateLimtsType {
    [key: string]: {
        requests: number;
        lastRequest: Date;
    }
}

class RateLimit {
    private rateLimits: rateLimtsType = {};

    public rateLimit(ip: string): Boolean {
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