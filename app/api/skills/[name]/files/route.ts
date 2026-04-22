import { getSkillFiles } from '@/lib/skills';
import { NextRequest } from 'next/server';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ name: string }> },
) {
	const { name } = await params;
	const files = await getSkillFiles(name);

	if (!files.length) {
		return Response.json(
			{ error: 'Skill not found or has no files' },
			{ status: 404 },
		);
	}

	return Response.json(files);
}
