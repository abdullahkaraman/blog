'use client';

import { useState, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, PenLine, UserRound } from 'lucide-react';
import SearchModal from '@/components/ui/SearchModal';
import Container from '@/components/ui/container';
import { setAttr } from '@directus/visual-editing';

interface NavigationBarProps {
	navigation: any;
	globals: any;
}

const NavigationBar = forwardRef<HTMLElement, NavigationBarProps>(({ navigation, globals }, ref) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const directusURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
	const lightLogoUrl = globals?.logo ? `${directusURL}/assets/${globals.logo}` : '/images/logo.svg';
	const siteTitle = globals?.title || 'Medium Clone';

	const handleLinkClick = () => {
		setMenuOpen(false);
	};

	return (
		<header ref={ref} className="sticky top-0 z-[60] w-full border-b border-neutral-200 bg-white text-neutral-950">
			<Container className="flex h-16 items-center justify-between gap-4">
				<Link href="/" className="flex min-w-0 flex-shrink-0 items-center gap-3">
					{globals?.logo ? (
						<Image src={lightLogoUrl} alt={siteTitle} width={120} height={48} className="h-8 w-auto" priority />
					) : (
						<span className="font-serif text-2xl text-neutral-950">{siteTitle}</span>
					)}
				</Link>

				<nav className="flex min-w-0 items-center gap-3">
					<div className="hidden sm:block">
						<SearchModal variant="bar" />
					</div>
					<NavigationMenu
						className="hidden lg:flex"
						data-directus={
							navigation
								? setAttr({
										collection: 'navigation',
										item: navigation.id,
										fields: ['items'],
										mode: 'modal',
									})
								: undefined
						}
					>
						<NavigationMenuList className="flex gap-5">
							{navigation?.items?.map((section: any) => (
								<NavigationMenuItem key={section.id}>
									<NavigationMenuLink
										href={section.page?.permalink || section.url || '#'}
										className="text-sm text-neutral-600 hover:text-neutral-950"
									>
										{section.title}
									</NavigationMenuLink>
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>

					<Link
						href="/write"
						className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 sm:flex"
					>
						<PenLine className="size-4" />
						Write
					</Link>

					<div className="flex sm:hidden">
						<SearchModal />
					</div>

					<div className="flex lg:hidden">
						<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" aria-label="Open menu">
									<Menu />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56 p-3 shadow-md">
								<div className="flex flex-col gap-4">
									{navigation?.items?.map((section: any) => (
										<Link
											key={section.id}
											href={section.page?.permalink || section.url || '#'}
											className="text-sm text-neutral-700"
											onClick={handleLinkClick}
										>
											{section.title}
										</Link>
									))}
									<Link
										href="/write"
										className="flex items-center gap-2 text-sm text-neutral-700"
										onClick={handleLinkClick}
									>
										<PenLine className="size-4" />
										Write
									</Link>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<button
						type="button"
						aria-label="User profile"
						className="flex size-9 items-center justify-center rounded-full bg-neutral-950 text-white hover:bg-neutral-800"
					>
						<UserRound className="size-4" />
					</button>
				</nav>
			</Container>
		</header>
	);
});
NavigationBar.displayName = 'NavigationBar';
export default NavigationBar;
