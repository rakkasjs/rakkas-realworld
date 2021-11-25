import { z } from "zod";
import isURL from "validator/lib/isURL";

export type NewUser = z.infer<typeof NewUser>;
export const NewUser = z.object({
	username: z.string().nonempty("can't be blank"),
	email: z.string().nonempty("can't be blank").email("is invalid"),
	password: z
		.string()
		.nonempty("can't be blank")
		.min(8, "is too short (minimum is 8 characters)"),
});

export type LoginCredentials = z.infer<typeof LoginCredentials>;
export const LoginCredentials = z.object({
	// No need to validate the e-mail address
	email: z.string(),
	password: z.string(),
});

export type PaginationOptions = z.infer<typeof PaginationOptions>;
export const PaginationOptions = z.object({
	offset: z.number().int().optional(),
	limit: z.number().int().optional(),
});

export type ListArticlesOptions = z.infer<typeof ListArticlesOptions>;
export const ListArticlesOptions = PaginationOptions.extend({
	tag: z.string().optional(),
	author: z.string().optional(),
	favorited: z.string().optional(),
});

export type UpdateUser = z.infer<typeof UpdateUser>;
export const UpdateUser = z
	.object({
		email: z.string().email("is invalid"),
		password: z
			.string()
			.nonempty("can't be blank")
			.min(8, "is too short (minimum is 8 characters)"),
		username: z.string().nonempty("can't be blank"),
		bio: z.string(),
		image: z.string().refine((s) => !s || isURL(s), "is invalid"),
	})
	.partial();

export type NewArticle = z.infer<typeof NewArticle>;
export const NewArticle = z.object({
	title: z.string().nonempty("can't be blank"),
	description: z.string().nonempty("can't be blank"),
	body: z.string().nonempty("can't be blank"),
	tagList: z.array(z.string()),
});

export type UpdateArticle = z.infer<typeof UpdateArticle>;
export const UpdateArticle = z
	.object({
		title: z.string().nonempty("can't be blank"),
		description: z.string().nonempty("can't be blank"),
		body: z.string().nonempty("can't be blank"),
		tagList: z.array(z.string().nonempty()),
	})
	.partial();
