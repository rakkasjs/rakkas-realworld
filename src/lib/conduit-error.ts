import { getReasonPhrase } from "http-status-codes";
import { json } from "@hattip/response";

export class ConduitError extends Error {
	readonly issues?: Readonly<Record<string, string[]>>;
	readonly status?: number;

	constructor(
		status?: number,
		message?: string,
		issues?: Readonly<Record<string, string[]>>,
	) {
		super(
			message ||
				(status && getSafeReasonPhrase(status)) ||
				"An error has occured",
		);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = "ConduitError";
		this.status = status;
		this.issues = issues;
	}

	get messages(): string[] {
		if (!this.issues) return [this.message];

		const messages: string[] = [];
		for (const [field, issues] of Object.entries(this.issues)) {
			if (!issues) continue;

			for (const issue of issues) {
				messages.push(field + " " + issue);
			}
		}

		return messages;
	}

	toResponse(): Response {
		return json({ errors: this.issues }, { status: this.status || 500 });
	}
}

function getSafeReasonPhrase(status: number) {
	try {
		return getReasonPhrase(status);
	} catch {
		return undefined;
	}
}
