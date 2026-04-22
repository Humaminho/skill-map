'use client';

import type { SkillFile } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
	FolderIcon,
	FolderOpenIcon,
	FileIcon,
	FileTextIcon,
	FileCodeIcon,
} from 'lucide-react';
import { useState } from 'react';

interface SkillFileTreeProps {
	files: SkillFile[];
	selectedFile: string | null;
	onSelectFile: (path: string) => void;
	depth?: number;
}

function getFileIcon(name: string) {
	if (name.endsWith('.md')) return FileTextIcon;
	if (
		name.endsWith('.ts') ||
		name.endsWith('.tsx') ||
		name.endsWith('.js') ||
		name.endsWith('.jsx') ||
		name.endsWith('.py') ||
		name.endsWith('.sh')
	)
		return FileCodeIcon;
	return FileIcon;
}

function FileTreeItem({
	file,
	selectedFile,
	onSelectFile,
	depth = 0,
}: {
	file: SkillFile;
	selectedFile: string | null;
	onSelectFile: (path: string) => void;
	depth?: number;
}) {
	const [expanded, setExpanded] = useState(depth === 0);

	if (file.isDirectory) {
		const Icon = expanded ? FolderOpenIcon : FolderIcon;
		return (
			<div>
				<button
					onClick={() => setExpanded(!expanded)}
					className={cn(
						'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs hover:bg-accent',
					)}
					style={{ paddingLeft: `${depth * 12 + 8}px` }}
				>
					<Icon className="size-3.5 shrink-0 text-muted-foreground" />
					<span className="truncate font-medium">{file.name}</span>
				</button>
				{expanded && file.children && (
					<div>
						{file.children.map((child) => (
							<FileTreeItem
								key={child.path}
								file={child}
								selectedFile={selectedFile}
								onSelectFile={onSelectFile}
								depth={depth + 1}
							/>
						))}
					</div>
				)}
			</div>
		);
	}

	const Icon = getFileIcon(file.name);
	const isSelected = selectedFile === file.path;

	return (
		<button
			onClick={() => onSelectFile(file.path)}
			className={cn(
				'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs hover:bg-accent',
				isSelected && 'bg-accent text-accent-foreground',
			)}
			style={{ paddingLeft: `${depth * 12 + 8}px` }}
		>
			<Icon className="size-3.5 shrink-0 text-muted-foreground" />
			<span className="truncate">{file.name}</span>
		</button>
	);
}

export function SkillFileTree({
	files,
	selectedFile,
	onSelectFile,
	depth = 0,
}: SkillFileTreeProps) {
	if (files.length === 0) {
		return (
			<p className="px-2 py-4 text-xs text-muted-foreground">
				No files found.
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-0.5">
			{files.map((file) => (
				<FileTreeItem
					key={file.path}
					file={file}
					selectedFile={selectedFile}
					onSelectFile={onSelectFile}
					depth={depth}
				/>
			))}
		</div>
	);
}
