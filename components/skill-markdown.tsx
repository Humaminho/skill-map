'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import type { BundledLanguage } from 'shiki';

interface SkillMarkdownProps {
	content: string;
}

async function highlightCode(code: string, lang: string, theme: string) {
	const { codeToHtml } = await import('shiki');
	return codeToHtml(code, {
		lang: lang as BundledLanguage,
		theme,
	});
}

function CodeBlock({ language, code }: { language: string; code: string }) {
	const [html, setHtml] = useState<string | null>(null);
	const { resolvedTheme } = useTheme();
	const shikiTheme =
		resolvedTheme === 'dark' ? 'vesper' : 'one-light';

	useEffect(() => {
		let cancelled = false;
		highlightCode(code, language || 'text', shikiTheme)
			.then((result) => {
				if (!cancelled) setHtml(result);
			})
			.catch(() => {
				// Fallback: no highlighting
				if (!cancelled) setHtml(null);
			});
		return () => {
			cancelled = true;
		};
	}, [code, language, shikiTheme]);

	if (html) {
		return (
			<div
				className="overflow-x-auto rounded-lg text-[0.75rem] leading-relaxed [&_pre]:p-4"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		);
	}

	return (
		<pre className="overflow-x-auto rounded-lg bg-muted p-4 text-[0.75rem] leading-relaxed">
			<code>{code}</code>
		</pre>
	);
}

export function SkillMarkdown({ content }: SkillMarkdownProps) {
	return (
		<div className="prose-sm max-w-none">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					h1: ({ children }) => (
						<h1 className="mb-4 text-xl font-bold tracking-tight">
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className="mb-3 mt-8 text-base font-semibold tracking-tight border-b pb-2">
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className="mb-2 mt-6 text-sm font-semibold">
							{children}
						</h3>
					),
					p: ({ children }) => (
						<p className="mb-3 text-xs leading-relaxed text-foreground/90">
							{children}
						</p>
					),
					ul: ({ children }) => (
						<ul className="mb-3 list-disc pl-5 text-xs leading-relaxed text-foreground/90">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="mb-3 list-decimal pl-5 text-xs leading-relaxed text-foreground/90">
							{children}
						</ol>
					),
					li: ({ children }) => <li className="mb-1">{children}</li>,
					a: ({ href, children }) => (
						<a
							href={href}
							className="text-primary underline underline-offset-2 hover:text-primary/80"
							target="_blank"
							rel="noopener noreferrer"
						>
							{children}
						</a>
					),
					strong: ({ children }) => (
						<strong className="font-semibold text-foreground">
							{children}
						</strong>
					),
					code: ({ className, children }) => {
						const match = /language-(\w+)/.exec(className || '');
						const codeStr = String(children).replace(/\n$/, '');

						if (match) {
							return (
								<CodeBlock language={match[1]} code={codeStr} />
							);
						}

						return (
							<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.7rem]">
								{children}
							</code>
						);
					},
					pre: ({ children }) => <>{children}</>,
					table: ({ children }) => (
						<div className="mb-4 overflow-x-auto rounded-lg border">
							<table className="w-full text-xs">{children}</table>
						</div>
					),
					thead: ({ children }) => (
						<thead className="border-b bg-muted">{children}</thead>
					),
					th: ({ children }) => (
						<th className="px-3 py-2 text-left font-medium">
							{children}
						</th>
					),
					td: ({ children }) => (
						<td className="px-3 py-2 text-foreground/80">
							{children}
						</td>
					),
					blockquote: ({ children }) => (
						<blockquote className="mb-3 border-l-2 border-primary/30 pl-4 italic text-muted-foreground">
							{children}
						</blockquote>
					),
					hr: () => <hr className="my-6 border-border" />,
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
