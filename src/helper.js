export const monthNames = (localeString) => Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString(localeString, {
    month: "long"
  })
);

export const getISOWeek = (date) => {

  // Normalize to UTC midnight.
  const day = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  );

  // ISO weeks start on Monday. Convert Sunday from 0 to 7.
  const dayNumber = day.getUTCDay() || 7;

  // Move to the Thursday of the current ISO week.
  day.setUTCDate(day.getUTCDate() + 4 - dayNumber);

  const isoYear = day.getUTCFullYear();

  // Find the first Thursday of the ISO year.
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const firstThursdayOffset =
    (4 - (yearStart.getUTCDay() || 7) + 7) % 7;

  const firstThursday = new Date(yearStart);
  firstThursday.setUTCDate(
    yearStart.getUTCDate() + firstThursdayOffset
  );

  const week = Math.floor(
    (day - firstThursday) / (7 * 24 * 60 * 60 * 1000)
  ) + 1;

  return {
    year: isoYear,
    week,
    label: `${String(week).padStart(2, "0")}`
  };
};

export const giniIndex = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("values must be a non-empty array");
  }

  if (!values.every(Number.isFinite)) {
    throw new Error("values must contain only finite numbers");
  }

  if (values.some(value => value < 0)) {
    throw new Error("Gini index requires non-negative values");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const total = sorted.reduce((sum, value) => sum + value, 0);

  // If everyone earns zero, inequality is treated as zero.
  if (total === 0) return 0;

  const weightedSum = sorted.reduce(
    (sum, value, index) => sum + (index + 1) * value,
    0
  );

  return (2 * weightedSum) / (n * total) - (n + 1) / n;
}
