/**
 * User permission levels in the system
 */
export enum Permission {
    STUDENT = 0,
    TEACHER = 1,
    ADMIN = 2
}

/**
 * Map permission levels to display names
 */
export const PERMISSION_NAMES: Record<Permission, string> = {
    [Permission.STUDENT]: "Schüler",
    [Permission.TEACHER]: "Lehrer",
    [Permission.ADMIN]: "Admin"
};

/**
 * Date format constants used throughout the application
 */
export const DATE_FORMATS = {
    DATE_TIME_SHORT: "DD.MM. HH:mm",
    DATE_TIME_FULL: "DD.MM.YYYY HH:mm",
    DATE_ONLY: "DD.MM.YYYY",
    ISO_DATE_START: (year: number) => `${year}-01-01`,
    ISO_DATE_END: (year: number) => `${year}-12-31`
} as const;

/**
 * Special event type for notes
 */
export const SPECIAL_EVENT_TYPES = {
    NOTE: "NOTE",
    NOTE_DELETE: "Notiz:Löschen",
    LESSON_PREFIX: "Unterricht:"
} as const;
