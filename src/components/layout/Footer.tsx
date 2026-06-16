'use client';

import { forwardRef } from 'react';
import Link from 'next/link';

import Container from '@/components/ui/container';

interface FooterProps {
	navigation?: unknown;
	globals?: {
		title?: string | null;
	};
}

const footerLinks = [
	{ label: 'Help', href: '/help' },
	{ label: 'Status', href: '/status' },
	{ label: 'About', href: '/about' },
	{ label: 'Careers', href: '/careers' },
	{ label: 'Blog', href: '/' },
	{ label: 'Privacy', href: '/privacy' },
	{ label: 'Terms', href: '/terms' },
];

const Footer = forwardRef<HTMLElement, FooterProps>((_, ref) => {
	const siteTitle = 'iyiblog';

	return (
		<footer ref={ref} className="border-t border-neutral-200 bg-white py-8 text-neutral-500">
			<Container className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
				<p>
					© {new Date().getFullYear()} {siteTitle}
				</p>
				<nav aria-label="Footer navigation">
					<ul className="flex flex-wrap gap-x-5 gap-y-2">
						{footerLinks.map((link) => (
							<li key={link.label}>
								<Link href={link.href} className="hover:text-neutral-950">
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</Container>
		</footer>
	);
});

Footer.displayName = 'Footer';
export default Footer;
