interface rateLimtsType {
    [key: string]: {
        requests: number;
        lastRequest: Date;
    }
}

class RateLimit {
    private rateLimits: rateLimtsType = {};

    public rateLimit(ip: string): Boolean {
        console.log(1)
        if (!this.rateLimits[ip]) {
            this.rateLimits[ip] = {
                requests: 1,
                lastRequest: new Date(),
            }
            console.log(2)
            return false;
        } else {
            if (new Date().getTime() - this.rateLimits[ip].lastRequest.getTime() > 60000) {
                this.rateLimits[ip].requests = 1;
                this.rateLimits[ip].lastRequest = new Date();
                console.log(3)
                return false;
            } else if (this.rateLimits[ip].requests >= 10) {
                this.rateLimits[ip].requests++;
                this.rateLimits[ip].lastRequest = new Date();
                console.log(4)
                return true;
            } else {
                this.rateLimits[ip].requests++;
                this.rateLimits[ip].lastRequest = new Date();
                console.log(5)
                return false;
            }
        }
    }
}

export default RateLimit;