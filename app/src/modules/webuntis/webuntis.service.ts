import "server-only";
import { Klasse, Teacher, Timegrid, WebAPITimetable, WebUntis, WebUntisElementType } from "webuntis";
import logger from "@/app/src/modules/logger";

/**  Class to interact with Untis API and hold authentication state */
export default class WebUntisService {
    /**
     * WebUntis client instance
     *
     * @private
     * @type {WebUntis}
     */
    private client: WebUntis;

    /**
     * Promise that resolves when login is complete
     *
     * @private
     * @type {?Promise<any>}
     */
    private loginPromise?: Promise<any>;

    /**
     * Creates an instance of UntisService.
     *
     * @constructor
     * @param {string} school The school name in WebUntis
     * @param {string} username The username to login with in the WebUntis-API
     * @param {string} password The password to login with in the WebUntis-API
     * @param {string} baseUrl The base URL of the WebUntis instance from the school
     */
    constructor(school: string, username: string, password: string, baseUrl: string) {
        this.client = new WebUntis(school, username, password, baseUrl);
    }

    /**
     * Login to the WebUntis API if not already logged in
     *
     * @private
     * @async
     * @returns {Promise<void>} Returns a promise that resolves when login is complete
     */
    private async loginOnce(): Promise<void> {
        if (!this.loginPromise) {
            this.loginPromise = this.client.login().catch((error) => {
                this.loginPromise = undefined;
                logger.error("Untis login failed: " + error, "WebUntis-Service");
            });
        }
        return this.loginPromise;
    }

    /**
     * Logout from the WebUntis API
     *
     * @public
     * @async
     * @returns {Promise<void>} Returns a promise that resolves when logout is complete
     */
    public async logout(): Promise<void> {
        await this.client.logout();
        this.loginPromise = undefined;
    }

    /**
     * Get the timegrid for the school
     *
     * @public
     * @async
     * @returns {Promise<Timegrid[]>} Returns a promise that resolves to an array of Timegrid objects
     */
    public async getTimegrid(): Promise<Timegrid[]> {
        await this.loginOnce();
        return await this.client.getTimegrid();

    }

    /**
     * Get all classes for the school in the current school year
     * 
     * @public
     * @async
     * @returns {Promise<Klasse[]>} Returns a promise that resolves to an array of WebUntis class objects
     */
    public async getClasses(): Promise<Klasse[]> {
        await this.loginOnce();
        const currentSchoolyear = await this.client.getCurrentSchoolyear();
        return await this.client.getClasses(true, currentSchoolyear.id);
    }

    /**
     * Get all teachers for the school
     *
     * @public
     * @async
     * @returns {Promise<Teacher[]>} Returns a promise that resolves to an array of WebUntis teacher objects
     */
    public async getTeachers(): Promise<Teacher[]> {
        await this.loginOnce();
        return this.client.getTeachers();
    }

    /**
     * Get the timetable for a given class and date
     *
     * @public
     * @async
     * @param {number} classNumber The number of the class element in WebUntis
     * @param {Date} date One date within the week to fetch the timetable for
     * @returns {Promise<WebAPITimetable[]>} Returns a promise that resolves to an array of WebUntis WEB-API timetable objects
     */
    public async getTimetable(classNumber: number, date: Date): Promise<WebAPITimetable[]> {
        await this.loginOnce();
        return this.client.getTimetableForWeek(date, classNumber, WebUntisElementType.CLASS);
    }
}