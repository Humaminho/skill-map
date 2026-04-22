import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import matter from 'gray-matter';
import type {
	Skill,
	SkillDetail,
	SkillFile,
	SkillFrontmatter,
} from '@/lib/types';

const SKILLS_DIR = /* turbopackIgnore: true */ path.join(
	os.homedir(),
	'.agents',
	'skills',
);

// Category inference from skill name patterns
const CATEGORY_PATTERNS: [RegExp, string][] = [
	[/^gsap-/, 'Animation'],
	[/^remotion/, 'Animation'],
	[/^shader/, 'Animation'],
	[
		/^expo-|^native-|^react-native|^building-native|^upgrading-expo/,
		'Mobile',
	],
	[/^shadcn$|^frontend-|^web-design|^canvas-|^theme-/, 'Design'],
	[/^fullstack|^stripe/, 'Full-Stack'],
	[/^docx$|^pdf$|^pptx$|^xlsx$/, 'Documents'],
	[/^skill-creator$|^find-skills$|^agent-|^ask-questions/, 'Meta'],
	[/^full-output/, 'Utility'],
	[/^algorithmic-art$/, 'Creative'],
];

function inferCategory(name: string, metadata?: { category?: string }): string {
	if (metadata?.category) return metadata.category;
	for (const [pattern, category] of CATEGORY_PATTERNS) {
		if (pattern.test(name)) return category;
	}
	return 'General';
}

function parseTriggersFromDescription(description: string): {
	whenToUse: string[];
	whenNotToUse: string[];
} {
	const whenToUse: string[] = [];
	const whenNotToUse: string[] = [];

	// Extract "TRIGGER when:" blocks
	const triggerMatch = description.match(
		/TRIGGER\s+when:\s*([\s\S]*?)(?:DO\s+NOT\s+TRIGGER|NOT\s+for:|$)/i,
	);
	if (triggerMatch) {
		whenToUse.push(
			...triggerMatch[1]
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
		);
	}

	// Extract "Use when..." / "Use this skill when..." sentences
	const useWhenMatches = description.match(
		/(?:Use(?:\s+this)?(?:\s+skill)?\s+when[^.]*\.)/gi,
	);
	if (useWhenMatches) {
		whenToUse.push(...useWhenMatches.map((s) => s.trim()));
	}

	// Extract "Triggers include:" blocks
	const triggersInclude = description.match(
		/Triggers?\s+include:?\s*([\s\S]*?)(?:\.|$)/i,
	);
	if (triggersInclude) {
		whenToUse.push(triggersInclude[1].trim());
	}

	// Extract "Do NOT use..." / "DO NOT TRIGGER when..."
	const notUseMatches = description.match(
		/(?:Do\s+NOT\s+(?:use|trigger)[^.]*\.)/gi,
	);
	if (notUseMatches) {
		whenNotToUse.push(...notUseMatches.map((s) => s.trim()));
	}

	// Extract "NOT for:" blocks
	const notForMatch = description.match(/NOT\s+for:\s*([\s\S]*?)$/i);
	if (notForMatch) {
		whenNotToUse.push(
			...notForMatch[1]
				.split(',')
				.map((s) => s.trim().replace(/\.$/, ''))
				.filter(Boolean),
		);
	}

	return { whenToUse, whenNotToUse };
}

function parseTriggersFromBody(body: string): {
	whenToUse: string[];
	whenNotToUse: string[];
} {
	const whenToUse: string[] = [];
	const whenNotToUse: string[] = [];

	// Match "## When to Use" sections
	const whenToUseSection = body.match(
		/##\s*When\s+to\s+Use[\s\S]*?\n([\s\S]*?)(?=\n##\s|$)/i,
	);
	if (whenToUseSection) {
		const lines = whenToUseSection[1]
			.split('\n')
			.map((l) => l.replace(/^[-*]\s*/, '').trim())
			.filter((l) => l.length > 0 && !l.startsWith('#'));
		whenToUse.push(...lines);
	}

	// Match "USE this skill when:" sections
	const useSection = body.match(
		/\*\*USE\s+this\s+skill\s+when:\*\*\s*\n([\s\S]*?)(?=\n\*\*NOT|$)/i,
	);
	if (useSection) {
		const lines = useSection[1]
			.split('\n')
			.map((l) => l.replace(/^[-*]\s*/, '').trim())
			.filter((l) => l.length > 0);
		whenToUse.push(...lines);
	}

	// Match "NOT for:" sections
	const notForSection = body.match(
		/\*\*NOT\s+for:\*\*\s*\n([\s\S]*?)(?=\n##\s|$)/i,
	);
	if (notForSection) {
		const lines = notForSection[1]
			.split('\n')
			.map((l) => l.replace(/^[-*]\s*/, '').trim())
			.filter((l) => l.length > 0);
		whenNotToUse.push(...lines);
	}

	return { whenToUse, whenNotToUse };
}

function extractCrossReferences(
	body: string,
	allSkillNames: Set<string>,
): string[] {
	const refs = new Set<string>();
	// Match **skill-name** bold references
	const boldPattern = /\*\*([a-z][a-z0-9-]*)\*\*/g;
	let match;
	while ((match = boldPattern.exec(body)) !== null) {
		const candidate = match[1];
		if (allSkillNames.has(candidate)) {
			refs.add(candidate);
		}
	}
	return Array.from(refs);
}

async function countFiles(dirPath: string): Promise<number> {
	let count = 0;
	const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;
		if (entry.isDirectory()) {
			count += await countFiles(path.join(dirPath, entry.name));
		} else {
			count++;
		}
	}
	return count;
}

function parseSkillFrontmatter(skillDir: string): {
	frontmatter: SkillFrontmatter;
	body: string;
	raw: string;
} | null {
	const skillMdPath = path.join(skillDir, 'SKILL.md');
	if (!fs.existsSync(skillMdPath)) return null;

	const raw = fs.readFileSync(skillMdPath, 'utf-8');
	const { data, content } = matter(raw);

	return {
		frontmatter: data as SkillFrontmatter,
		body: content,
		raw,
	};
}

export async function listAllSkills(): Promise<Skill[]> {
	if (!fs.existsSync(SKILLS_DIR)) return [];

	const entries = await fs.promises.readdir(SKILLS_DIR, {
		withFileTypes: true,
	});
	const skillDirs = entries.filter(
		(e) => e.isDirectory() && !e.name.startsWith('.'),
	);

	// First pass: collect all valid skill names
	const allSkillNames = new Set<string>();
	const parsedSkills: {
		dirName: string;
		frontmatter: SkillFrontmatter;
		body: string;
		dirPath: string;
	}[] = [];

	for (const dir of skillDirs) {
		const dirPath = path.join(SKILLS_DIR, dir.name);
		const parsed = parseSkillFrontmatter(dirPath);
		if (parsed) {
			allSkillNames.add(parsed.frontmatter.name || dir.name);
			parsedSkills.push({
				dirName: dir.name,
				frontmatter: parsed.frontmatter,
				body: parsed.body,
				dirPath,
			});
		}
	}

	// Second pass: build Skill objects with cross-references
	const skills: Skill[] = [];

	for (const { dirName, frontmatter, body, dirPath } of parsedSkills) {
		const name = frontmatter.name || dirName;
		const description = frontmatter.description || '';

		const descTriggers = parseTriggersFromDescription(description);
		const bodyTriggers = parseTriggersFromBody(body);

		const triggers = {
			whenToUse: [...descTriggers.whenToUse, ...bodyTriggers.whenToUse],
			whenNotToUse: [
				...descTriggers.whenNotToUse,
				...bodyTriggers.whenNotToUse,
			],
		};

		const crossRefs = extractCrossReferences(body, allSkillNames);
		// Remove self-references
		const filteredRefs = crossRefs.filter((r) => r !== name);

		const fileCount = await countFiles(dirPath);

		skills.push({
			name,
			description,
			category: inferCategory(name, frontmatter.metadata),
			license: frontmatter.license,
			version: frontmatter.version || frontmatter.metadata?.version,
			userInvocable: frontmatter['user-invocable'] !== false,
			triggers,
			crossReferences: filteredRefs,
			folderPath: dirPath,
			fileCount,
		});
	}

	return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSkillDetail(
	skillName: string,
): Promise<SkillDetail | null> {
	const skills = await listAllSkills();
	const skill = skills.find((s) => s.name === skillName);
	if (!skill) return null;

	const parsed = parseSkillFrontmatter(skill.folderPath);
	if (!parsed) return null;

	return {
		...skill,
		rawMarkdown: parsed.raw,
		bodyMarkdown: parsed.body,
	};
}

export async function getSkillFiles(skillName: string): Promise<SkillFile[]> {
	// Validate the skill exists
	const skillDir = await resolveSkillDir(skillName);
	if (!skillDir) return [];

	return buildFileTree(skillDir, skillDir);
}

async function buildFileTree(
	dirPath: string,
	rootPath: string,
): Promise<SkillFile[]> {
	const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
	const files: SkillFile[] = [];

	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;

		const fullPath = path.join(dirPath, entry.name);
		const relativePath = path.relative(rootPath, fullPath);

		if (entry.isDirectory()) {
			const children = await buildFileTree(fullPath, rootPath);
			files.push({
				name: entry.name,
				path: relativePath,
				isDirectory: true,
				children,
			});
		} else {
			files.push({
				name: entry.name,
				path: relativePath,
				isDirectory: false,
			});
		}
	}

	return files.sort((a, b) => {
		// Directories first, then alphabetical
		if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
}

export async function getFileContent(
	skillName: string,
	filePath: string,
): Promise<string | null> {
	const skillDir = await resolveSkillDir(skillName);
	if (!skillDir) return null;

	// Path traversal protection
	const resolved = path.resolve(skillDir, filePath);
	if (!resolved.startsWith(skillDir + path.sep) && resolved !== skillDir) {
		return null;
	}

	if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
		return null;
	}

	return fs.readFileSync(resolved, 'utf-8');
}

async function resolveSkillDir(skillName: string): Promise<string | null> {
	if (!fs.existsSync(SKILLS_DIR)) return null;

	// Validate: skill name must be a simple directory name (no path separators)
	if (
		skillName.includes('/') ||
		skillName.includes('\\') ||
		skillName === '..' ||
		skillName === '.'
	) {
		return null;
	}

	const dirPath = path.join(SKILLS_DIR, skillName);
	const resolved = path.resolve(dirPath);

	// Ensure resolved path is inside SKILLS_DIR
	if (!resolved.startsWith(SKILLS_DIR + path.sep)) {
		return null;
	}

	if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
		return null;
	}

	return resolved;
}
