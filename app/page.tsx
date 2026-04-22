import { listAllSkills } from '@/lib/skills';
import { SkillsExplorer } from '@/components/skills-explorer';

export default async function Home() {
	const skills = await listAllSkills();

	return (
		<div className="flex flex-1 flex-col">
			<SkillsExplorer skills={skills} />
		</div>
	);
}
