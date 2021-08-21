export interface UserResponse {
	user: User;
}

export interface User {
	email: string;
	token: string;
	username: string;
	bio: string;
	image: string;
}

export interface NewUserRequest {
	user: NewUser;
}

export interface NewUser {
	username: string;
	email: string;
	password: string;
}

export interface LoginUserRequest {
	user: LoginUser;
}

export interface LoginUser {
	email: string;
	password: string;
}

export interface UpdateUserRequest {
	user: UpdateUser;
}

export interface UpdateUser {
	email?: string;
	password?: string;
	username?: string;
	bio?: string;
	image?: string;
}

export interface NewArticleRequest {
	article: NewArticle;
}

export interface NewArticle {
	title: string;
	description: string;
	body: string;
	tagList?: string[];
}

export interface UpdateArticleRequest {
	article: UpdateArticle;
}

export interface UpdateArticle {
	title?: string;
	description?: string;
	body?: string;
}

export interface SingleArticleResponse {
	article: Article;
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

export interface Profile {
	username: string;
	bio: string | null;
	image: string | null;
	following: boolean;
}

export interface NewCommentRequest {
	comment: NewComment;
}

export interface NewComment {
	body: string;
}

export interface MultipleCommentsResponse {
	comments: Comment[];
}

export interface CommentResponse {
	comment: Comment;
}

export interface Comment {
	id: number;
	createdAt: string;
	updatedAt: string;
	body: string;
	author: Profile;
}
