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

/** Asserts that a value is a promise */
export function isThenable<T>(value: T | Promise<T>): value is Promise<T> {
	return typeof (value as Promise<T>).then === "function";
}
