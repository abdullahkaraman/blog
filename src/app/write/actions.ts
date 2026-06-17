'use server';

import { createItem, withToken } from '@directus/sdk';
import { redirect } from 'next/navigation';

import { getDirectusServerToken, useDirectus } from '@/lib/directus/directus';
import { calculateReadTimeValue, stripHtml } from '@/lib/posts';
import { sanitizeHtml } from '@/lib/rich-text';
import type { Post } from '@/types/directus-schema';

export type WriteActionState = {
	error?: string;
};

function slugify(title: string) {
	const slug = title
		.toLowerCase()
		.trim()
		.replace(/['"]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return slug || `story-${Date.now()}`;
}

export async function publishPostAction(_state: WriteActionState, formData: FormData): Promise<WriteActionState> {
	const title = String(formData.get('title') || '').trim();
	const rawContent = String(formData.get('content') || '').trim();
	const status = formData.get('status') === 'draft' ? 'draft' : 'published';

	if (title.length < 3) {
		return { error: 'Add a title before publishing.' };
	}

	if (stripHtml(rawContent).length < 20) {
		return { error: 'Write a little more before publishing.' };
	}

	const content = sanitizeHtml(rawContent);
	const slug = slugify(title);
	let createdSlug = slug;
	const payload = {
		title,
		slug,
		content,
		description: stripHtml(content).slice(0, 180),
		read_time: calculateReadTimeValue(content),
		status,
		published_at: status === 'published' ? new Date().toISOString() : null,
	} satisfies Partial<Post>;

	try {
		const token = getDirectusServerToken();
		const { directus } = useDirectus();
		const post = await directus.request<Post>(withToken(token, createItem('posts', payload)));

		createdSlug = post.slug || slug;
	} catch (error) {
		console.warn('Error publishing post:', error instanceof Error ? error.message : String(error));

		return { error: 'Could not publish this story. Check Directus permissions for posts.create.' };
	}

	redirect(`/blog/${createdSlug}`);
}
