import type { Metadata } from 'next';

import WriteEditor from './WriteEditor';

export const metadata: Metadata = {
	title: 'Write',
	description: 'Create and publish a new story.',
};

export default function WritePage() {
	return <WriteEditor />;
}
