import { getSkillDetail } from '@/lib/skills';
import { NextRequest } from 'next/server';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ name: string }> },
) {
	const { name } = await params;
	const skill = await getSkillDetail(name);

	if (!skill) {
		return Response.json({ error: 'Skill not found' }, { status: 404 });
	}

	return Response.json(skill);
}
