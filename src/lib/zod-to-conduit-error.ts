import { ZodError } from "zod";

export function zodToConduitError(
	zodError: ZodError,
): Record<string, string[]> {
	const result: Record<string, string[]> = {};

	for (const issue of zodError.issues) {
		const cause = issue.path[issue.path.length - 1];
		result[cause] = result[cause] || [];
		result[cause].push(issue.message);
	}

	return result;
}
