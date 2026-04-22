import { listAllSkills } from '@/lib/skills';
import { GraphPage } from '@/components/graph-page';

export default async function Graph() {
	const skills = await listAllSkills();

	return <GraphPage skills={skills} />;
}
