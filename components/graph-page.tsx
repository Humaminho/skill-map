'use client';

import { useState } from 'react';
import type { Skill } from '@/lib/types';
import { SkillGraphView } from '@/components/skill-graph-view';
import { SkillDetailModal } from '@/components/skill-detail-modal';
import { SiteHeader } from '@/components/site-header';

interface GraphPageProps {
	skills: Skill[];
}

export function GraphPage({ skills }: GraphPageProps) {
	const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	function handleNodeClick(skillName: string) {
		const skill = skills.find((s) => s.name === skillName);
		if (skill) {
			setSelectedSkill(skill);
			setModalOpen(true);
		}
	}

	return (
		<div className="flex h-screen flex-col">
			<SiteHeader />

			<main className="relative min-h-0 flex-1">
				<div className="absolute inset-0">
					<SkillGraphView
						skills={skills}
						onNodeClick={handleNodeClick}
					/>
				</div>
			</main>

			<SkillDetailModal
				skill={selectedSkill}
				open={modalOpen}
				onOpenChange={setModalOpen}
				allSkills={skills}
				onNavigateToSkill={(skill) => {
					setSelectedSkill(skill);
					setModalOpen(true);
				}}
			/>
		</div>
	);
}
