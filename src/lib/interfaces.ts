export interface ConduitAuthInterface {
	register(user: NewUser): Promise<User>;
	login(credentials: LoginCredentials): Promise<User>;
	updateUser(user: UpdateUser): Promise<User>;
}

export interface ConduitInterface {
	getCurrentUser(): Promise<User>;
	getProfile(username: string): Promise<Profile>;
	followUser(username: string): Promise<Profile>;
	unfollowUser(username: string): Promise<Profile>;

	listArticles(options: ListArticlesOptions): Promise<ArticleList>;
	feedArticles(options: PaginationOptions): Promise<ArticleList>;
	getArticle(slug: string): Promise<Article>;
	createArticle(article: NewArticle): Promise<Article>;
	updateArticle(slug: string, article: UpdateArticle): Promise<Article>;
	deleteArticle(slug: string): Promise<void>;
	favoriteArticle(slug: string): Promise<Article>;
	unfavoriteArticle(slug: string): Promise<Article>;

	getComments(slug: string): Promise<Comment[]>;
	addComment(slug: string, comment: string): Promise<Comment>;
	deleteComment(slug: string, id: number): Promise<void>;

	getTags(): Promise<string[]>;
}

import type {
	NewUser,
	LoginCredentials,
	ListArticlesOptions,
	PaginationOptions,
	UpdateUser,
	NewArticle,
	UpdateArticle,
} from "lib/validation";

export type {
	NewUser,
	LoginCredentials,
	ListArticlesOptions,
	PaginationOptions,
	UpdateUser,
	NewArticle,
	UpdateArticle,
};

export interface UserSummary {
	id: number;
	username: string;
	token: string;
}

export interface User {
	email: string;
	token: string;
	username: string;
	bio: string;
	image: string | null;
}

export interface Profile {
	username: string;
	bio: string;
	image: string | null;
	following: boolean;
}

export interface ArticleList {
	articles: Article[];
	articlesCount: number;
}

export interface Article {
	slug: string;
	title: string;
	description: string;
	body: string;
	tagList: string[];
	createdAt: string;
	updatedAt: string;
	favorited: boolean;
	favoritesCount: number;
	author: Profile;
}

export interface Comment {
	id: number;
	createdAt: string;
	updatedAt: string;
	body: string;
	author: Profile;
}
