'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CopyIcon, FileWarningIcon } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import type { BundledLanguage } from 'shiki';

interface FileViewerProps {
	skillName: string;
	filePath: string;
}

const TEXT_EXTENSIONS = new Set([
	'ts',
	'tsx',
	'js',
	'jsx',
	'mjs',
	'cjs',
	'py',
	'rb',
	'go',
	'rs',
	'java',
	'kt',
	'swift',
	'c',
	'cpp',
	'h',
	'sh',
	'bash',
	'zsh',
	'fish',
	'md',
	'mdx',
	'txt',
	'text',
	'log',
	'json',
	'jsonc',
	'yaml',
	'yml',
	'toml',
	'ini',
	'env',
	'cfg',
	'css',
	'scss',
	'less',
	'html',
	'htm',
	'xml',
	'svg',
	'sql',
	'graphql',
	'gql',
	'dockerfile',
	'gitignore',
	'editorconfig',
	'lock',
	'csv',
	'tsv',
]);

const LANG_MAP: Record<string, string> = {
	ts: 'typescript',
	tsx: 'tsx',
	js: 'javascript',
	jsx: 'jsx',
	mjs: 'javascript',
	cjs: 'javascript',
	py: 'python',
	rb: 'ruby',
	go: 'go',
	rs: 'rust',
	sh: 'bash',
	bash: 'bash',
	zsh: 'bash',
	md: 'markdown',
	mdx: 'markdown',
	json: 'json',
	jsonc: 'jsonc',
	yaml: 'yaml',
	yml: 'yaml',
	toml: 'toml',
	css: 'css',
	scss: 'scss',
	less: 'less',
	html: 'html',
	htm: 'html',
	xml: 'xml',
	svg: 'xml',
	sql: 'sql',
	graphql: 'graphql',
	txt: 'text',
};

function getExtension(filePath: string): string {
	const name = filePath.split('/').pop() ?? '';
	// Handle dotfiles like .gitignore
	if (name.startsWith('.') && !name.includes('.', 1)) {
		return name.slice(1);
	}
	return name.split('.').pop()?.toLowerCase() ?? '';
}

function isTextFile(filePath: string): boolean {
	const ext = getExtension(filePath);
	const name = (filePath.split('/').pop() ?? '').toLowerCase();
	// Known text filenames without extensions
	if (
		['dockerfile', 'makefile', 'license', 'readme', 'changelog'].includes(
			name,
		)
	) {
		return true;
	}
	return TEXT_EXTENSIONS.has(ext);
}

function getLanguageFromPath(filePath: string): string {
	const ext = getExtension(filePath);
	return LANG_MAP[ext] || 'text';
}

async function highlightCode(code: string, lang: string, theme: string) {
	const { codeToHtml } = await import('shiki');
	return codeToHtml(code, {
		lang: lang as BundledLanguage,
		theme,
	});
}

export function FileViewer({ skillName, filePath }: FileViewerProps) {
	const [content, setContent] = useState<string | null>(null);
	const [highlighted, setHighlighted] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const { copy } = useCopyToClipboard();
	const { resolvedTheme } = useTheme();

	const shikiTheme = resolvedTheme === 'dark' ? 'vesper' : 'one-light';
	// 'vesper' is also a good choice for dark theme

	useEffect(() => {
		setLoading(true);
		setContent(null);
		setHighlighted(null);

		if (!isTextFile(filePath)) {
			setLoading(false);
			return;
		}

		fetch(`/api/skills/${encodeURIComponent(skillName)}/files/${filePath}`)
			.then((r) => (r.ok ? r.text() : null))
			.then((text) => {
				setContent(text);
				if (text) {
					const lang = getLanguageFromPath(filePath);
					highlightCode(text, lang, shikiTheme)
						.then((html) => setHighlighted(html))
						.catch(() => setHighlighted(null));
				}
			})
			.finally(() => setLoading(false));
	}, [skillName, filePath, shikiTheme]);

	// Unsupported / binary file type
	if (!isTextFile(filePath)) {
		const ext = getExtension(filePath);
		return (
			<div className="flex flex-col items-center justify-center gap-3 p-10 text-muted-foreground">
				<FileWarningIcon
					className="size-8 text-muted-foreground/40"
					aria-hidden="true"
				/>
				<p className="text-xs font-medium">
					Cannot preview{' '}
					<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.7rem]">
						.{ext}
					</code>{' '}
					files
				</p>
				<p className="text-[0.65rem] text-muted-foreground/70">
					Binary and media files are not supported in the viewer.
				</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex flex-col gap-2 p-4">
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	if (content === null) {
		return (
			<div className="flex items-center justify-center p-6 text-muted-foreground">
				<p className="text-xs">Failed to load file content.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<div className="flex items-center gap-2 border-b px-4 py-2">
				<span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
					{filePath}
				</span>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => copy(content, 'file content')}
				>
					<CopyIcon />
					<span className="sr-only">Copy file content</span>
				</Button>
			</div>
			{highlighted ? (
				<div
					className="overflow-x-auto text-[0.72rem] leading-relaxed [&_pre]:p-4 [&_code]:whitespace-pre [&_code]:break-normal"
					dangerouslySetInnerHTML={{ __html: highlighted }}
				/>
			) : (
				<pre className="overflow-x-auto whitespace-pre break-normal p-4 font-mono text-[0.72rem] leading-relaxed">
					{content}
				</pre>
			)}
		</div>
	);
}
