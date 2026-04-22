'use client';

import { useState, useEffect } from 'react';
import type { Skill, SkillDetail, SkillFile } from '@/lib/types';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { CopyIcon, ClipboardCopyIcon, FileTextIcon } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { SkillMarkdown } from '@/components/skill-markdown';
import { TriggerInspector } from '@/components/trigger-inspector';
import { SkillFileTree } from '@/components/skill-file-tree';
import { FileViewer } from '@/components/file-viewer';

interface SkillDetailSheetProps {
	skill: Skill | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	allSkills: Skill[];
	onNavigateToSkill: (skill: Skill) => void;
}

export function SkillDetailSheet({
	skill,
	open,
	onOpenChange,
	allSkills,
	onNavigateToSkill,
}: SkillDetailSheetProps) {
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
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="w-full sm:max-w-2xl lg:max-w-3xl"
			>
				<SheetHeader>
					<div className="flex items-center gap-3">
						<SheetTitle className="text-base">
							{skill.name}
						</SheetTitle>
						<Badge variant="secondary">{skill.category}</Badge>
						{skill.version && (
							<Badge variant="outline">v{skill.version}</Badge>
						)}
					</div>
					<SheetDescription className="line-clamp-3">
						{skill.description}
					</SheetDescription>
					<div className="flex items-center gap-2 pt-1">
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
				</SheetHeader>

				<Separator />

				{loading ? (
					<div className="flex flex-col gap-3 p-6">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				) : (
					<Tabs
						defaultValue="overview"
						className="flex-1 overflow-hidden"
					>
						<div className="px-6">
							<TabsList>
								<TabsTrigger value="overview">
									<FileTextIcon data-icon="inline-start" />
									Overview
								</TabsTrigger>
								<TabsTrigger value="triggers">
									Triggers
								</TabsTrigger>
								<TabsTrigger value="files">
									Files{' '}
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
							className="flex-1 overflow-hidden"
						>
							<ScrollArea className="h-[calc(100vh-280px)]">
								<div className="p-6">
									{detail ? (
										<SkillMarkdown
											content={detail.bodyMarkdown}
										/>
									) : (
										<p className="text-muted-foreground">
											Failed to load skill content.
										</p>
									)}
								</div>
							</ScrollArea>
						</TabsContent>

						<TabsContent
							value="triggers"
							className="flex-1 overflow-hidden"
						>
							<ScrollArea className="h-[calc(100vh-280px)]">
								<div className="p-6">
									<TriggerInspector
										skill={skill}
										allSkills={allSkills}
										onNavigateToSkill={onNavigateToSkill}
									/>
								</div>
							</ScrollArea>
						</TabsContent>

						<TabsContent
							value="files"
							className="flex-1 overflow-hidden"
						>
							<div className="flex h-[calc(100vh-280px)]">
								<div className="w-56 shrink-0 border-r">
									<ScrollArea className="h-full">
										<div className="p-3">
											<SkillFileTree
												files={files}
												selectedFile={selectedFile}
												onSelectFile={setSelectedFile}
											/>
										</div>
									</ScrollArea>
								</div>
								<div className="flex-1 overflow-hidden">
									<ScrollArea className="h-full">
										{selectedFile ? (
											<FileViewer
												skillName={skill.name}
												filePath={selectedFile}
											/>
										) : (
											<div className="flex h-full items-center justify-center p-6 text-muted-foreground">
												<p className="text-xs">
													Select a file from the tree
													to view its contents.
												</p>
											</div>
										)}
									</ScrollArea>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				)}
			</SheetContent>
		</Sheet>
	);
}
