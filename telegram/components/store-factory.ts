interface StoreReturnType<T, K extends keyof T> {
	deleteKey: (key: K) => void;
	set: (key: K, value: T[K]) => void;
	// TODO: fix any type
	// get: (key: K) => T[K];
	get: (key: K) => any;
}

export function createStore<T, K extends keyof T>(
	initialValue: T
): StoreReturnType<T, K> {
	const store = initialValue;

	const deleteKey = (key: K): void => {
		delete store[key];
	};
	const set = (key: K, value: T[K]): void => {
		store[key] = {
			...store[key],
			...value,
		};
	};
	const get = (key: K): T[K] => store[key];

	return {
		deleteKey,
		set,
		get,
	};
}
