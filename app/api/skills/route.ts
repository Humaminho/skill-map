import { listAllSkills } from '@/lib/skills';

export async function GET() {
	const skills = await listAllSkills();
	return Response.json(skills);
}
