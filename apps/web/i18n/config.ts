/**
 * Dates are formatted in one fixed zone, so the server render and the browser
 * agree (no hydration mismatch) and a post published late in the evening
 * shows the day it was published where it was written.
 */
export const SITE_TIME_ZONE = 'Europe/Rome'
