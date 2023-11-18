export function biggestInArr(arr: number[]): [number, number] {
	let biggest: [number, number] = [0, 0];
	arr.forEach((item, index) => {
		if (!biggest) {
			biggest = [item, index];
		} else if (biggest[0] < item) {
			biggest = [item, index];
		}
	});
	return biggest;
}

export function smallestInArr(arr: number[]): [number, number] {
	let smallest: [number, number] = [0, 0];
	arr.forEach((item, index) => {
		if (!smallest) {
			smallest = [item, index];
		} else if (smallest[0] > item) {
			smallest = [item, index];
		}
	});
	return smallest;
}

export function diffInPercents(a: number, b: number): number {
	return ((b - a) / a) * 100;
}

// TODO: seems like this method pointless
export function toFixed(number: string | number, dp: number = 8): number {
	return +parseFloat(String(number)).toFixed(dp);
}
