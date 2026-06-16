import {
	fetchHomepagePosts,
	fetchPageData,
	fetchPageDataById,
	fetchSiteData,
	getPageIdByPermalink,
} from '@/lib/directus/fetchers';
import { PageBlock, type Page } from '@/types/directus-schema';
import { notFound } from 'next/navigation';
import PageClient from './PageClient';
import MediumHomePage from '@/components/home/MediumHomePage';

export async function generateMetadata({
	params,
	searchParams,
}: {
	params: Promise<{ permalink?: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { permalink } = await params;
	const searchParamsResolved = await searchParams;
	const permalinkSegments = permalink || [];
	const resolvedPermalink = `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';

	const preview = searchParamsResolved.preview === 'true';
	const version = typeof searchParamsResolved.version === 'string' ? searchParamsResolved.version : '';

	if (resolvedPermalink === '/' && !preview && !version) {
		const { globals } = await fetchSiteData();

		return {
			title: globals?.title ?? 'Home',
			description: globals?.description ?? '',
			openGraph: {
				title: globals?.title ?? 'Home',
				description: globals?.description ?? '',
				url: process.env.NEXT_PUBLIC_SITE_URL,
				type: 'website',
			},
		};
	}

	// Skip metadata generation for preview/versioned content
	if (preview || version) {
		return {
			title: 'Preview Mode',
			description: 'Content preview',
		};
	}

	try {
		const page = await fetchPageData(resolvedPermalink);

		if (!page) return;

		return {
			title: page.seo?.title ?? page.title ?? '',
			description: page.seo?.meta_description ?? '',
			openGraph: {
				title: page.seo?.title ?? page.title ?? '',
				description: page.seo?.meta_description ?? '',
				url: `${process.env.NEXT_PUBLIC_SITE_URL}${resolvedPermalink}`,
				type: 'website',
			},
		};
	} catch (error) {
		console.warn('Error loading page metadata:', error instanceof Error ? error.message : String(error));

		return;
	}
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ permalink?: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { permalink } = await params;
	const searchParamsResolved = await searchParams;
	const permalinkSegments = permalink || [];
	const resolvedPermalink = `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';

	const id = typeof searchParamsResolved.id === 'string' ? searchParamsResolved.id : '';
	const version = typeof searchParamsResolved.version === 'string' ? searchParamsResolved.version : '';
	const preview = searchParamsResolved.preview === 'true';
	const token = preview ? process.env.DIRECTUS_SERVER_TOKEN : undefined;
	// Live preview adds version = main which is not required when fetching the main version.
	const fixedVersion = version !== 'main' ? version : undefined;

	if (resolvedPermalink === '/' && !preview && !fixedVersion) {
		const [{ globals }, posts] = await Promise.all([fetchSiteData(), fetchHomepagePosts(10)]);

		return <MediumHomePage globals={globals} posts={posts} />;
	}

	try {
		let page: Page;

		// Version-specific content handling:
		// When a version is requested (e.g., "draft", "published"), we need to:
		// 1. Look up the page ID by permalink if not provided directly
		// 2. Fetch the specific version of that page
		// 3. Fail gracefully if the page doesn't exist for that version
		if (fixedVersion && id) {
			// We have both ID and version - fetch the specific version
			page = await fetchPageDataById(id, fixedVersion, token);
		} else if (fixedVersion && !id) {
			// We have version but no ID - look up the page ID first
			const pageId = await getPageIdByPermalink(resolvedPermalink, token);
			if (!pageId) {
				notFound();
			}
			page = await fetchPageDataById(pageId, fixedVersion, token);
		} else {
			// Regular page fetch (published or draft with preview)
			page = await fetchPageData(resolvedPermalink, 1, token, preview);
		}

		if (!page || !page.blocks) {
			notFound();
		}

		const blocks: PageBlock[] = (page.blocks as PageBlock[]) || [];

		return <PageClient sections={blocks} pageId={page.id} />;
	} catch (error) {
		console.warn('Error loading page:', error instanceof Error ? error.message : String(error));
		notFound();
	}
}
