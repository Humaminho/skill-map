import { getFileContent } from '@/lib/skills';
import { NextRequest } from 'next/server';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ name: string; path: string[] }> },
) {
	const { name, path: pathSegments } = await params;

	if (!pathSegments || pathSegments.length === 0) {
		return Response.json({ error: 'File path required' }, { status: 400 });
	}

	const filePath = pathSegments.join('/');
	const content = await getFileContent(name, filePath);

	if (content === null) {
		return Response.json({ error: 'File not found' }, { status: 404 });
	}

	return new Response(content, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
