const firstNames = [
  "alex",
  "jordan",
  "taylor",
  "morgan",
  "casey",
  "riley",
  "jamie",
  "sam",
  "avery",
  "quinn",
];

const locationArray = [
	"bath", "kitchen", null, "lol"
]

const getRandomItemFromArray = (array) => array[Math.floor(Math.random() * array.length)];

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinPastThreeYears(): Date {
  const now = Date.now();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const timestamp = randomInteger(threeYearsAgo.getTime(), now);
  return new Date(timestamp);
}

export type CustomField = {
	name: string;
	value: {
		name: string;
	};
}

class DataPoint {
	duration: {
		minutes: number
	};
	author: {
		login: string;
	};
	date: number;
	issue: {
		customFields: {
			name: string;
			value: {
				name: string;
			};
		}[]
	}

	constructor() {
		this.duration = {
			minutes: randomInteger(1, 90),
		};

		this.author = {
			login: getRandomItemFromArray(firstNames)
		};

		this.date = randomDateWithinPastThreeYears().getTime();
		this.issue = {
			customFields: [
				{
					name:  getRandomItemFromArray(["Test", "Just testing", "some uninteresting category"]),
					value: {
						name: getRandomItemFromArray(["bozo", "lol", "JK"])
					}
				},
				{
					name: "location",
					value: {
						name: getRandomItemFromArray(locationArray)
					}
				}
			]
		}
	}
};

export default DataPoint
