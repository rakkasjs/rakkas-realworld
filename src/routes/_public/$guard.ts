import { PageRouteGuard } from "rakkasjs";

export const pageGuard: PageRouteGuard = (ctx) => {
	if (ctx.queryClient.getQueryData("user")) {
		return { redirect: "/" };
	}

	return true;
};
