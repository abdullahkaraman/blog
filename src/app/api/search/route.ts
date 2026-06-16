import { getDirectusServerToken, useDirectus } from '@/lib/directus/directus';
import { NextResponse } from 'next/server';

const formatDirectusError = (error: unknown) => {
	if (typeof error === 'object' && error !== null && 'message' in error) {
		const message = String((error as { message: unknown }).message);
		const status = (error as { response?: { status?: number } }).response?.status;

		return status ? `${message} (status ${status})` : message;
	}

	return error instanceof Error ? error.message : String(error);
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const search = searchParams.get('search');

	if (!search || search.length < 3) {
		return NextResponse.json({ error: 'Query must be at least 3 characters.' }, { status: 400 });
	}

	const { directus, readItems, withToken } = useDirectus();
	const token = getDirectusServerToken();

	try {
		const [pages, posts] = await Promise.all([
			directus.request(
				withToken(
					token as string,
					readItems('pages', {
						filter: {
							_or: [{ title: { _contains: search } }, { permalink: { _contains: search } }],
						},
						fields: ['id', 'title', 'permalink', 'seo'],
					}),
				),
			),

			directus.request(
				withToken(
					token as string,
					readItems('posts', {
						filter: {
							_or: [
								{ title: { _contains: search } },
								{ description: { _contains: search } },
								{ slug: { _contains: search } },
							],
						},
						fields: ['id', 'title', 'description', 'slug'],
					}),
				),
			),
		]);

		const results = [
			...pages.map((page: any) => ({
				id: page.id,
				title: page.title,
				description: page.seo.meta_description,
				type: 'Page',
				link: `/${page.permalink.replace(/^\/+/, '')}`,
			})),

			...posts.map((post: any) => ({
				id: post.id,
				title: post.title,
				description: post.description,
				type: 'Post',
				link: `/blog/${post.slug}`,
			})),
		];

		return NextResponse.json(results);
	} catch (error) {
		console.warn('Error fetching search results:', formatDirectusError(error));

		return NextResponse.json([]);
	}
}
