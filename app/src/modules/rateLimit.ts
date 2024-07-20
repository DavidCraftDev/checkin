import "server-only";

interface rateLimtsType {
    [key: string]: {
        requests: number;
        lastRequest: Date;
    }
}

const rateLimits: rateLimtsType = {};

async function rateLimit(ip: string) {
    if (!rateLimits[ip]) {
        rateLimits[ip] = {
            requests: 1,
            lastRequest: new Date(),
        }
        return false;
    } else {
        if (new Date().getTime() - rateLimits[ip].lastRequest.getTime() > 60000) {
            rateLimits[ip].requests = 1;
            rateLimits[ip].lastRequest = new Date();
            return false;
        } else if (rateLimits[ip].requests >= 10) {
            rateLimits[ip].requests++;
            rateLimits[ip].lastRequest = new Date();
            return true;
        } else {
            rateLimits[ip].requests++;
            rateLimits[ip].lastRequest = new Date();
            return false;
        }
    }
}

export default rateLimit;