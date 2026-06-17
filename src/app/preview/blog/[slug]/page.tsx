import { draftMode } from 'next/headers';

import BlogPostArticle from '@/components/blog/BlogPostArticle';
import { fetchPostByIdAndVersion, fetchPostBySlug, getPostIdBySlug } from '@/lib/directus/fetchers';
import type { Post } from '@/types/directus-schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PreviewSearchParams = {
	id?: string;
	token?: string;
	version?: string;
};

export default async function PreviewBlogPostPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<PreviewSearchParams>;
}) {
	const { slug } = await params;
	const { id, token, version } = await searchParams;
	const draft = await draftMode();
	const isAuthorized = draft.isEnabled || (!!token && token === process.env.DIRECTUS_SERVER_TOKEN);

	if (!isAuthorized) {
		return <div className="text-center text-xl mt-[20%]">401 - Preview Not Authorized</div>;
	}

	const serverToken = process.env.DIRECTUS_SERVER_TOKEN;
	const fixedVersion = version && version !== 'main' ? version : undefined;

	try {
		let post: Post | null;
		let relatedPosts: Post[] = [];
		let postId = id;

		if (fixedVersion && !postId) {
			const foundPostId = await getPostIdBySlug(slug, serverToken);

			if (!foundPostId) {
				return <div className="text-center text-xl mt-[20%]">404 - Post Not Found</div>;
			}

			postId = String(foundPostId);
		}

		if (postId && fixedVersion) {
			const result = await fetchPostByIdAndVersion(postId, fixedVersion, slug, serverToken);
			post = result.post;
			relatedPosts = result.relatedPosts;
		} else {
			const result = await fetchPostBySlug(slug, {
				draft: true,
				token: serverToken,
			});
			post = result.post;
			relatedPosts = result.relatedPosts;
		}

		if (!post) {
			return <div className="text-center text-xl mt-[20%]">404 - Post Not Found</div>;
		}

		return <BlogPostArticle post={post} relatedPosts={relatedPosts} slug={slug} />;
	} catch (error) {
		console.warn('Error loading preview blog post:', error instanceof Error ? error.message : String(error));

		return <div className="text-center text-xl mt-[20%]">404 - Post Not Found</div>;
	}
}
