/** @file Provides rate limiting functionality for IP addresses */

import "server-only";

/**
 * Interface for the rate limits stored in the RateLimit class
 *
 * @interface rateLimtsType
 */
interface rateLimtsType {
    /** The number of requests made by the IP address */
    [key: string]: {
        requests: number;
        /** The timestamp of the last request made by the IP address */
        lastRequest: Date;
    }
}

/**
 * Provides rate limiting functionality for IP addresses
 *
 * @class RateLimit
 */
class RateLimit {
    /**
     * An object to store the rate limit information for each IP address
     *
     * @private
     * @type {rateLimtsType}
     */
    private rateLimits: rateLimtsType = {};
    /**
     * The maximum number of requests allowed within the window
     *
     * @private
     * @type {number} The maximum number of requests allowed within the window
     */
    private limit: number;
    /**
     * The time window in milliseconds for rate limiting
     *
     * @private
     * @type {number} The time window in milliseconds for rate limiting
     */
    private window: number;

    /**
     * Creates an instance of RateLimit.
     *
     * @constructor
     * @param {number} [limit=50] The maximum number of requests allowed within the window
     * @param {number} [window=60000] The time window in milliseconds for rate limiting
     */
    constructor(limit: number = 50, window: number = 60000) {
        this.limit = limit;
        this.window = window;
    }

    /**
     * Checks if the given IP address has exceeded the rate limit.
     *
     * @public
     * @param {string} ip The IP address to check for rate limiting
     * @returns {Boolean} Returns true if the IP address has exceeded the rate limit, otherwise false
     */
    public rateLimit(ip: string): Boolean {
        if (!this.rateLimits[ip]) {
            this.rateLimits[ip] = {
                requests: 1,
                lastRequest: new Date(),
            }
            return false;
        } else {
            if (new Date().getTime() - this.rateLimits[ip].lastRequest.getTime() > this.window) {
                this.rateLimits[ip].requests = 1;
                this.rateLimits[ip].lastRequest = new Date();
                return false;
            } else if (this.rateLimits[ip].requests > this.limit) {
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