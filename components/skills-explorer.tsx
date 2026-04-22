'use client';

import { useState, useMemo } from 'react';
import type { Skill } from '@/lib/types';
import { SkillCard } from '@/components/skill-card';
import { SkillDetailModal } from '@/components/skill-detail-modal';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SearchIcon } from 'lucide-react';

interface SkillsExplorerProps {
	skills: Skill[];
}

export function SkillsExplorer({ skills }: SkillsExplorerProps) {
	const [search, setSearch] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		null,
	);
	const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const categories = useMemo(() => {
		const map = new Map<string, number>();
		for (const s of skills) {
			map.set(s.category, (map.get(s.category) ?? 0) + 1);
		}
		return Array.from(map.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [skills]);

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return skills.filter((skill) => {
			const matchesCategory =
				!selectedCategory || skill.category === selectedCategory;
			if (!matchesCategory) return false;
			if (!q) return true;

			return (
				skill.name.toLowerCase().includes(q) ||
				skill.description.toLowerCase().includes(q) ||
				skill.triggers.whenToUse.some((t) =>
					t.toLowerCase().includes(q),
				) ||
				skill.triggers.whenNotToUse.some((t) =>
					t.toLowerCase().includes(q),
				)
			);
		});
	}, [skills, search, selectedCategory]);

	function handleSelectSkill(skill: Skill) {
		setSelectedSkill(skill);
		setModalOpen(true);
	}

	return (
		<>
			<SiteHeader
				search={search}
				onSearchChange={setSearch}
				categories={categories}
				selectedCategory={selectedCategory}
				onCategoryChange={setSelectedCategory}
				totalSkillCount={skills.length}
			/>

			<main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
				{filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
						<SearchIcon
							className="size-10 text-muted-foreground/40"
							aria-hidden="true"
						/>
						<p className="text-sm font-medium text-muted-foreground">
							No skills found
						</p>
						<p className="text-xs text-muted-foreground/80">
							Try adjusting your search or filter criteria.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{filtered.map((skill) => (
							<SkillCard
								key={skill.name}
								skill={skill}
								onSelect={handleSelectSkill}
							/>
						))}
					</div>
				)}
			</main>

			<SiteFooter />

			<SkillDetailModal
				skill={selectedSkill}
				open={modalOpen}
				onOpenChange={setModalOpen}
				allSkills={skills}
				onNavigateToSkill={handleSelectSkill}
			/>
		</>
	);
}
