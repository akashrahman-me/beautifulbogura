/** Day of week in Bangladesh (0 = Sunday … 6 = Saturday), whatever the server's timezone. */
export const dhakaWeekday = (d = new Date()) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', weekday: 'short' }).format(d));

export const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);
export const daysAhead = (n: number, from = new Date()) => new Date(from.getTime() + n * 864e5);
