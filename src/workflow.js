const wi = require('./work-items');

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOURS_TO_WORK_A_WEEK = 40;

const project = ctx.issue.project;

// Calculate start and end of the last week:
let from = new Date();
from.setHours(0, 0, 0, 0); // the start of this day
from = from.getTime() - 7 * DAY_IN_MS; // the start of last Monday
const to = from + 7 * DAY_IN_MS - 1; // the end of last Sunday

// Get a list of assignees from the Assignee field in the project,
// get a list of work items for each of them, and calculate sum of durations
// for the work items reported by each assignee:
const durations = {};
const assignees = ctx.Assignee.values;
assignees.forEach(function (assignee) {
    const items = wi.fetchWorkItems(assignee, project, from, to);
    let duration = 0; // duration in minutes
    items.forEach(function (item) {
        duration += item.duration;
    });
    durations[assignee.login] = duration / 60;
});
