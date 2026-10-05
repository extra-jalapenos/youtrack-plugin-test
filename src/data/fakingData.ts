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

	constructor(dateOptions: Date[]) {
		this.duration = {
			minutes: randomInteger(1, 90),
		};

		this.author = {
			login: getRandomItemFromArray(firstNames)
		};

		this.date = getRandomItemFromArray(dateOptions).getTime();
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
