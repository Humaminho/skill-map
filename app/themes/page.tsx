'use client';

import { useEffect, useState } from 'react';
import type { BundledTheme, BundledLanguage } from 'shiki';

const SAMPLE_CODE = `import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// Fetch users from the API
async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {users.filter(u => u.isActive).map(user => (
        <li key={user.id}>
          {user.name} &mdash; {user.email}
        </li>
      ))}
    </ul>
  );
}`;

const ALL_THEMES: BundledTheme[] = [
	'ayu-light',
	'catppuccin-latte',
	'everforest-light',
	'github-light',
	'github-light-default',
	'github-light-high-contrast',
	'gruvbox-light-hard',
	'gruvbox-light-medium',
	'gruvbox-light-soft',
	'horizon-bright',
	'kanagawa-lotus',
	'light-plus',
	'material-theme-lighter',
	'min-light',
	'night-owl-light',
	'one-light',
	'rose-pine-dawn',
	'slack-ochin',
	'snazzy-light',
	'solarized-light',
	'vitesse-light',
];

function ThemeCard({ theme }: { theme: BundledTheme }) {
	const [html, setHtml] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		import('shiki').then(({ codeToHtml }) => {
			codeToHtml(SAMPLE_CODE, {
				lang: 'tsx' as BundledLanguage,
				theme,
			}).then((result) => {
				if (!cancelled) setHtml(result);
			});
		});
		return () => {
			cancelled = true;
		};
	}, [theme]);

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border">
			<div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
				<code className="select-all font-mono text-sm font-semibold">
					{theme}
				</code>
			</div>
			{html ? (
				<div
					className="overflow-x-auto text-[0.72rem] leading-relaxed [&_pre]:m-0 [&_pre]:rounded-none [&_pre]:p-4"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			) : (
				<div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
					Loading…
				</div>
			)}
		</div>
	);
}

export default function ThemesPage() {
	const [search, setSearch] = useState('');

	const filtered = ALL_THEMES.filter(
		(t) => !search || t.includes(search.toLowerCase()),
	);

	return (
		<div className="mx-auto max-w-[1600px] px-6 py-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">
					Shiki Light Theme Previews
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{ALL_THEMES.length} light themes — click the theme ID to
					select for easy copying
				</p>
			</div>

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<input
					type="text"
					placeholder="Filter themes…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="h-9 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
				/>
				<span className="text-xs text-muted-foreground">
					{filtered.length} theme{filtered.length !== 1 ? 's' : ''}{' '}
					shown
				</span>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{filtered.map((theme) => (
					<ThemeCard key={theme} theme={theme} />
				))}
			</div>
		</div>
	);
}
