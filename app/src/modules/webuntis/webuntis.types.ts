/** Types for the mapped data for the frontend timetable */

import { Timegrid } from "webuntis"

/**
 * This interface represents a lesson unit for the timetable in the frontend.
 *
 * @export
 * @interface LessonUnit
 */
export interface LessonUnit {
  /**
   * The unique identifier of the lesson from WebUntis
   *
   * @type {string}
   */
  id: string,
  /**
   * The name of the original course of the lesson
   *
   * @type {string}
   */
  course: string,
  /**
   * The ID of the teacher for the lesson
   *
   * @type {string}
   */
  teacherID: string,
  /**
   * The name of the teacher for the lesson
   *
   * @type {string}
   */
  teacherName: string
  /**
   * The room where the lesson takes place
   *
   * @type {string}
   */
  room: string,
  /**
   * Additional notes or comments about the lesson
   *
   * @type {string}
   */
  note: string,
  /**
   * The subjects covered from the teacher in the lesson
   *
   * @type {string[]}
   */
  subjects: string[],
  /**
   * The start time of the lesson in the format HHMM
   *
   * @type {number}
   */
  startTime: number,
  /**
   * The end time of the lesson in the format HHMM
   *
   * @type {number}
   */
  endTime: number,
  /**
   * Indicates whether the lesson has been cancelled
   *
   * @type {boolean}
   */
  cancelled: boolean
  /**
   * Indicates whether the room for the lesson has been changed
   *
   * @type {boolean}
   */
  roomChanged: boolean
  /**
   * Indicates whether the lesson is closed
   *
   * @type {boolean}
   */
  closed: boolean
}

/**
 * This interface represents the mapping of the timetable data for the frontend.
 *
 * @export
 * @interface TimetableMapping
 */
export interface TimetableMapping {
  /**
   * Holds the timetable data mapped by date and start time.
   *
   * @type {Record<string, Record<string, LessonUnit[]>>}
   */
  timetable: Record<string, Record<string, LessonUnit[]>>
  /**
   * The timegrid data from WebUntis.
   *
   * @type {Timegrid[]}
   */
  timegrid: Timegrid[]
}

/**
 * The result type for closing a study time lessons in the database.
 *
 * @export
 */
export type CloseStudyTimeResult = 'SUCCESS' | 'ALREADY_CLOSED' | 'LIMIT_EXCEEDED' | 'ERROR';