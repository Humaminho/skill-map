'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchIcon, NetworkIcon, LayoutGridIcon } from 'lucide-react';

interface SiteHeaderProps {
	/** Search value (only used on home page) */
	search?: string;
	onSearchChange?: (value: string) => void;
	/** Category filter state (only used on home page) */
	categories?: { name: string; count: number }[];
	selectedCategory?: string | null;
	onCategoryChange?: (category: string | null) => void;
	totalSkillCount?: number;
}

export function SiteHeader({
	search,
	onSearchChange,
	categories,
	selectedCategory,
	onCategoryChange,
	totalSkillCount,
}: SiteHeaderProps) {
	const pathname = usePathname();
	const isGraphPage = pathname === '/graph';

	return (
		<header className="sticky top-0 z-40 shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
				{/* Logo / brand */}
				<Link
					href="/"
					className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
				>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<NetworkIcon className="size-4" aria-hidden="true" />
					</div>
					<span className="font-heading text-lg font-semibold tracking-tight">
						SkillMap
					</span>
				</Link>

				{/* Search — home page only */}
				{!isGraphPage && onSearchChange && (
					<div className="relative ml-auto max-w-sm flex-1">
						<SearchIcon
							className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							placeholder="Search skills, triggers, descriptions…"
							value={search ?? ''}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-9"
							aria-label="Search skills"
							type="search"
						/>
					</div>
				)}

				{/* Graph page: show subtitle */}
				{isGraphPage && (
					<span className="ml-4 text-sm font-medium text-muted-foreground">
						Dependency Graph
					</span>
				)}

				{/* Nav actions */}
				<div
					className={`flex items-center gap-1 ${!isGraphPage ? '' : 'ml-auto'}`}
				>
					{isGraphPage ? (
						<Button variant="ghost" size="sm" asChild>
							<Link href="/">
								<LayoutGridIcon data-icon="inline-start" />
								Grid
							</Link>
						</Button>
					) : (
						<Button variant="ghost" size="sm" asChild>
							<Link href="/graph">
								<NetworkIcon data-icon="inline-start" />
								Graph
							</Link>
						</Button>
					)}
				</div>

				<ThemeToggle />
			</div>

			{/* Category filters — home page only */}
			{!isGraphPage && categories && onCategoryChange && (
				<nav
					aria-label="Filter by category"
					className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 pb-3"
				>
					<button
						type="button"
						onClick={() => onCategoryChange(null)}
					>
						<Badge
							variant={
								selectedCategory === null
									? 'default'
									: 'outline'
							}
						>
							All ({totalSkillCount ?? 0})
						</Badge>
					</button>
					{categories.map((cat) => (
						<button
							key={cat.name}
							type="button"
							onClick={() =>
								onCategoryChange(
									selectedCategory === cat.name
										? null
										: cat.name,
								)
							}
						>
							<Badge
								variant={
									selectedCategory === cat.name
										? 'default'
										: 'outline'
								}
							>
								{cat.name} ({cat.count})
							</Badge>
						</button>
					))}
				</nav>
			)}
		</header>
	);
}
