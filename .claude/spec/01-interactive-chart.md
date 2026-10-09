# Feature: React Visualization

## Goal
Future developers should have a template chart that is interactive to go off of. InteractiveChart will provide this.
It is a React Component in Typescript that will render an array of datapoints containing a date, a number of minutes, and a category.
The graph will have time on an x-Axis. The user can choose between agreggating the values for each category per year,  quarter of year, year month, or ISOYear and week.
Y axis should show the sum of minutes.

## Scope
If needed, create types, classes or interfaces in a separate types.ts file within the same directory.

## Data
generate an array of test datapoints. Store it in testdata.ts in the same directory and use it as data within the component.
Filter said def

## Edge cases
Negative values for numbers should be ignored.
Invalid dates such as 29th of February of a non leap year should be ignored.

## Acceptance criteria
- Use React component's attributes for most readable code.
- Write modular code; e.g. helper functions to stack the data
- use d3s library of functions for transforming the data, and visualizing it.
- Changing between timeframes is animated, using d3's transitions.

## Out of bounds
Do not modify any files outside InteractiveChart