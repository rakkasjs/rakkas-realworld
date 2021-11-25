/** Escapes URL components */
export function url(strings: TemplateStringsArray, ...values: any[]): string {
	let result = "";
	for (let i = 0; i < strings.length; i++) {
		result += strings[i];
		if (i < values.length) {
			result += encodeURIComponent(values[i]);
		}
	}

	return result;
}

/** Creates a lazy value that is not computed until it's called and then memoized */
export async function makeLazyValue<T>(
	factory: () => T | Promise<T>,
): Promise<T> {
	let value: T;
	let promise: Promise<T> | undefined;
	let isResolved = false;

	if (isResolved) {
		return value!;
	}

	if (promise) {
		return promise;
	}

	const valueOrPromise = factory();

	if (!isPromise(valueOrPromise)) {
		value = valueOrPromise;
		isResolved = true;

		return value;
	}

	return (promise = valueOrPromise.then((v) => {
		value = v;
		isResolved = true;

		return value;
	}));
}

/** Asserts that a value is a promise */
export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
	return typeof (value as Promise<T>).then === "function";
}
