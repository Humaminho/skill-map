'use client';

import type { Skill } from '@/lib/types';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
	CardAction,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { CopyIcon, FileTextIcon, GitForkIcon } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface SkillCardProps {
	skill: Skill;
	onSelect: (skill: Skill) => void;
}

export function SkillCard({ skill, onSelect }: SkillCardProps) {
	const { copy } = useCopyToClipboard();

	return (
		<Card
			role="button"
			tabIndex={0}
			className="cursor-pointer touch-manipulation transition-shadow hover:ring-2 hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			onClick={() => onSelect(skill)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onSelect(skill);
				}
			}}
		>
			<CardHeader>
				<CardTitle className="flex min-w-0 items-center gap-2">
					<span className="truncate">{skill.name}</span>
				</CardTitle>
				<CardAction>
					<Badge variant="secondary">{skill.category}</Badge>
				</CardAction>
				<CardDescription className="line-clamp-2">
					{skill.description.length > 140
						? skill.description.slice(0, 140) + '…'
						: skill.description}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-1.5">
					{skill.crossReferences.length > 0 && (
						<Badge variant="outline">
							<GitForkIcon data-icon="inline-start" />
							{skill.crossReferences.length} ref
							{skill.crossReferences.length !== 1 ? 's' : ''}
						</Badge>
					)}
					{skill.fileCount > 1 && (
						<Badge variant="outline">
							<FileTextIcon data-icon="inline-start" />
							{skill.fileCount} file
							{skill.fileCount !== 1 ? 's' : ''}
						</Badge>
					)}
					{!skill.userInvocable && (
						<Badge variant="destructive">System only</Badge>
					)}
				</div>
			</CardContent>
			<CardFooter className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={(e) => {
								e.stopPropagation();
								copy(skill.folderPath, 'folder path');
							}}
						>
							<CopyIcon />
							<span className="sr-only">Copy path</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Copy folder path</TooltipContent>
				</Tooltip>
				<span className="min-w-0 truncate text-[0.625rem] text-muted-foreground">
					{skill.folderPath.replace(/^\/Users\/[^/]+/, '~')}
				</span>
			</CardFooter>
		</Card>
	);
}
