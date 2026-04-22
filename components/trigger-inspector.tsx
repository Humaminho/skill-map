'use client';

import type { Skill } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CircleCheck, XCircleIcon, ArrowRightIcon } from 'lucide-react';

interface TriggerInspectorProps {
	skill: Skill;
	allSkills: Skill[];
	onNavigateToSkill: (skill: Skill) => void;
}

export function TriggerInspector({
	skill,
	allSkills,
	onNavigateToSkill,
}: TriggerInspectorProps) {
	const hasWhenToUse = skill.triggers.whenToUse.length > 0;
	const hasWhenNotToUse = skill.triggers.whenNotToUse.length > 0;
	const hasCrossRefs = skill.crossReferences.length > 0;

	return (
		<div className="flex flex-col gap-6">
			{/* When to Use */}
			<section>
				<div className="mb-3 flex items-center gap-2">
					<CircleCheck className="size-4 text-green-600" />
					<h3 className="text-sm font-semibold">When to Use</h3>
				</div>
				{hasWhenToUse ? (
					<ul className="flex flex-col gap-2">
						{skill.triggers.whenToUse.map((trigger, i) => (
							<li
								key={i}
								className="flex items-start gap-2 rounded-md border border-primary/10 bg-primary/5 px-3 py-2 text-xs leading-relaxed"
							>
								<ArrowRightIcon className="mt-0.5 size-3 shrink-0 text-primary" />
								<span>{trigger}</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-xs text-muted-foreground">
						No specific trigger conditions parsed from this skill.
					</p>
				)}
			</section>

			<Separator />

			{/* When NOT to Use */}
			<section>
				<div className="mb-3 flex items-center gap-2">
					<XCircleIcon className="size-4 text-destructive" />
					<h3 className="text-sm font-semibold">When NOT to Use</h3>
				</div>
				{hasWhenNotToUse ? (
					<ul className="flex flex-col gap-2">
						{skill.triggers.whenNotToUse.map((trigger, i) => (
							<li
								key={i}
								className="flex items-start gap-2 rounded-md border border-destructive/10 bg-destructive/5 px-3 py-2 text-xs leading-relaxed"
							>
								<XCircleIcon className="mt-0.5 size-3 shrink-0 text-destructive" />
								<span>{trigger}</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-xs text-muted-foreground">
						No exclusion conditions parsed from this skill.
					</p>
				)}
			</section>

			{/* Cross References */}
			{hasCrossRefs && (
				<>
					<Separator />
					<section>
						<h3 className="mb-3 text-sm font-semibold">
							Related Skills
						</h3>
						<div className="flex flex-wrap gap-2">
							{skill.crossReferences.map((ref) => {
								const refSkill = allSkills.find(
									(s) => s.name === ref,
								);
								return (
									<Badge
										key={ref}
										variant="outline"
										className={
											refSkill
												? 'cursor-pointer hover:bg-accent'
												: ''
										}
										onClick={() =>
											refSkill &&
											onNavigateToSkill(refSkill)
										}
									>
										{ref}
									</Badge>
								);
							})}
						</div>
					</section>
				</>
			)}

			{/* Raw Description */}
			<Separator />
			<section>
				<h3 className="mb-3 text-sm font-semibold">Raw Description</h3>
				<div className="rounded-md border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
					{skill.description}
				</div>
			</section>
		</div>
	);
}
