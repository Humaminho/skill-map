export interface SkillFrontmatter {
	name: string;
	description: string;
	license?: string;
	version?: string;
	'user-invocable'?: boolean;
	'allowed-tools'?: string;
	metadata?: {
		category?: string;
		version?: string;
		sources?: string[];
		[key: string]: unknown;
	};
}

export interface Skill {
	name: string;
	description: string;
	category: string;
	license?: string;
	version?: string;
	userInvocable: boolean;
	triggers: {
		whenToUse: string[];
		whenNotToUse: string[];
	};
	crossReferences: string[];
	folderPath: string;
	fileCount: number;
}

export interface SkillDetail extends Skill {
	rawMarkdown: string;
	bodyMarkdown: string;
}

export interface SkillFile {
	name: string;
	path: string;
	isDirectory: boolean;
	children?: SkillFile[];
}
