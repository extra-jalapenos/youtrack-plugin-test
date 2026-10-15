import { group, rollup, timeDays, timeMonday, timeMondays, union, utcMonday, utcMondays } from "d3"

export const getMondays = (from: Date, to: Date) => {
    return union([timeMonday.floor(from), ...timeMondays(from, to, 1), utcMonday.floor(to)])
}

export const getEmptyMap = (from: Date, to: Date) => timeDays(timeMonday(from), to)
