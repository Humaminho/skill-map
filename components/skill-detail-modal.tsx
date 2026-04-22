'use client';

import { useState, useEffect } from 'react';
import type { Skill, SkillDetail, SkillFile } from '@/lib/types';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CopyIcon, ClipboardCopyIcon, FileTextIcon } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { SkillMarkdown } from '@/components/skill-markdown';
import { TriggerInspector } from '@/components/trigger-inspector';
import { SkillFileTree } from '@/components/skill-file-tree';
import { FileViewer } from '@/components/file-viewer';

interface SkillDetailModalProps {
	skill: Skill | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	allSkills: Skill[];
	onNavigateToSkill: (skill: Skill) => void;
}

export function SkillDetailModal({
	skill,
	open,
	onOpenChange,
	allSkills,
	onNavigateToSkill,
}: SkillDetailModalProps) {
	const [detail, setDetail] = useState<SkillDetail | null>(null);
	const [files, setFiles] = useState<SkillFile[]>([]);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { copy } = useCopyToClipboard();

	useEffect(() => {
		if (!skill || !open) {
			setDetail(null);
			setFiles([]);
			setSelectedFile(null);
			return;
		}

		setLoading(true);
		setSelectedFile(null);

		Promise.all([
			fetch(`/api/skills/${encodeURIComponent(skill.name)}`).then((r) =>
				r.ok ? r.json() : null,
			),
			fetch(`/api/skills/${encodeURIComponent(skill.name)}/files`).then(
				(r) => (r.ok ? r.json() : []),
			),
		])
			.then(([detailData, filesData]) => {
				setDetail(detailData);
				setFiles(filesData);
			})
			.finally(() => setLoading(false));
	}, [skill, open]);

	if (!skill) return null;

	const referenceSnippet = `<skill>\n  <name>${skill.name}</name>\n  <file>~/.agents/skills/${skill.name}/SKILL.md</file>\n</skill>`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex h-[85vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl md:max-w-6xl lg:max-w-7xl">
				{/* Header */}
				<DialogHeader className="shrink-0 px-6 pt-6 pb-4">
					<div className="flex items-center gap-3 pr-8">
						<DialogTitle className="text-base font-semibold">
							{skill.name}
						</DialogTitle>
						<Badge variant="secondary">{skill.category}</Badge>
						{skill.version && (
							<Badge variant="outline">v{skill.version}</Badge>
						)}
					</div>
					<DialogDescription className="line-clamp-2">
						{skill.description}
					</DialogDescription>
					<div className="flex items-center gap-2 pt-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										copy(skill.folderPath, 'folder path')
									}
								>
									<CopyIcon data-icon="inline-start" />
									Copy Path
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								Copy folder path to clipboard
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										copy(
											referenceSnippet,
											'reference snippet',
										)
									}
								>
									<ClipboardCopyIcon data-icon="inline-start" />
									Copy Reference
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								Copy ready-to-use skill reference snippet
							</TooltipContent>
						</Tooltip>
					</div>
				</DialogHeader>

				<Separator />

				{/* Body */}
				{loading ? (
					<div className="flex flex-col gap-3 p-6">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				) : (
					<Tabs
						key={skill.name}
						defaultValue="overview"
						className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-0 overflow-hidden"
					>
						<div className="shrink-0 px-6 py-3 border-b">
							<TabsList>
								<TabsTrigger value="overview">
									<FileTextIcon data-icon="inline-start" />
									Overview
								</TabsTrigger>
								<TabsTrigger value="triggers">
									Triggers
								</TabsTrigger>
								<TabsTrigger value="files">
									Files
									{skill.fileCount > 1 && (
										<Badge
											variant="secondary"
											className="ml-1"
										>
											{skill.fileCount}
										</Badge>
									)}
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent
							value="overview"
							className="min-h-0 overflow-y-auto"
						>
							<div className="px-6 py-4">
								{detail ? (
									<SkillMarkdown
										content={detail.bodyMarkdown}
									/>
								) : (
									<p className="text-sm text-muted-foreground">
										Failed to load skill content.
									</p>
								)}
							</div>
						</TabsContent>

						<TabsContent
							value="triggers"
							className="min-h-0 overflow-y-auto"
						>
							<div className="px-6 py-4">
								<TriggerInspector
									skill={skill}
									allSkills={allSkills}
									onNavigateToSkill={onNavigateToSkill}
								/>
							</div>
						</TabsContent>

						<TabsContent
							value="files"
							className="min-h-0 flex-1 overflow-hidden"
						>
							<div className="flex h-full">
								<div className="w-56 shrink-0 overflow-y-auto border-r">
									<div className="p-3">
										<SkillFileTree
											files={files}
											selectedFile={selectedFile}
											onSelectFile={setSelectedFile}
										/>
									</div>
								</div>
								<div className="min-w-0 flex-1 overflow-y-auto">
									{selectedFile ? (
										<FileViewer
											skillName={skill.name}
											filePath={selectedFile}
										/>
									) : (
										<div className="flex h-full items-center justify-center p-6 text-muted-foreground">
											<p className="text-xs">
												Select a file to view its
												contents.
											</p>
										</div>
									)}
								</div>
							</div>
						</TabsContent>
					</Tabs>
				)}
			</DialogContent>
		</Dialog>
	);
}
