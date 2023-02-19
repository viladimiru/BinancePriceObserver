export function biggestInArr(arr) {
	let biggest;
	arr.forEach((item, index) => {
		if (!biggest) {
			biggest = [item, index];
		} else if (biggest[0] < item) {
			biggest = [item, index];
		}
	});
	return biggest;
}

export function smallestInArr(arr) {
	let smallest;
	arr.forEach((item, index) => {
		if (!smallest) {
			smallest = [item, index];
		} else if (smallest[0] > item) {
			smallest = [item, index];
		}
	});
	return smallest;
}

export function diffInPercents(a, b) {
	return ((b - a) / a) * 100;
}

export function toFixed(number, dp = 8) {
	return +parseFloat(number).toFixed(dp);
}
