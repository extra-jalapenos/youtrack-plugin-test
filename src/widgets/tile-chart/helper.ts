import { group, rollup, timeDays, timeMonday, timeMondays, union, utcMonday, utcMondays } from "d3"

export const getMondays = (from: Date, to: Date) => {
    return union([timeMonday.floor(from), ...timeMondays(from, to, 1), utcMonday.floor(to)])
}

export const getEmptyMap = (from: Date, to: Date) => {
    const allDays = timeDays(timeMonday(from), to)
    // now we have all days, and we group them
    console.log(from)
    console.log(timeMonday(from))

    return group(allDays, d => d == timeMonday(d) ? d : timeMonday(d))
}