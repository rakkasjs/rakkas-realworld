import { describe, it, expect } from "vitest";
import { zodToConduitError } from "./zod-to-conduit-error";
import { z } from "zod";

describe("Zod error to Conduit error conversion", () => {
	it("converts errors", () => {
		const r = z
			.object({
				nested: z.object({
					one: z.string().nonempty("can't be blank").min(5, "is too short"),
					two: z.string(),
				}),
			})
			.safeParse({
				nested: {
					one: "",
					two: 1234,
				},
			});

		if (r.success) throw new Error("Zod validation didn't fail");

		expect(zodToConduitError(r.error)).toMatchObject({
			one: ["can't be blank", "is too short"],
			// Let's not tie it to the exact error message wording
			two: [expect.stringContaining("string")],
		});
	});
});
