import type { Skill } from '@/lib/types';
import type { Node, Edge } from '@xyflow/react';
import dagre from '@dagrejs/dagre';

const NODE_WIDTH = 172;
const NODE_HEIGHT = 60;

export interface GraphData {
	nodes: Node[];
	edges: Edge[];
}

export function buildGraphData(skills: Skill[]): GraphData {
	const g = new dagre.graphlib.Graph();
	g.setDefaultEdgeLabel(() => ({}));
	g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 80 });

	const skillMap = new Map(skills.map((s) => [s.name, s]));

	// Collect all connected skill names
	const connectedNames = new Set<string>();
	for (const skill of skills) {
		if (skill.crossReferences.length > 0) {
			connectedNames.add(skill.name);
			for (const ref of skill.crossReferences) {
				if (skillMap.has(ref)) {
					connectedNames.add(ref);
				}
			}
		}
	}

	// Add nodes for connected skills only
	for (const name of connectedNames) {
		const skill = skillMap.get(name);
		if (!skill) continue;
		g.setNode(name, { width: NODE_WIDTH, height: NODE_HEIGHT });
	}

	// Add edges
	for (const skill of skills) {
		for (const ref of skill.crossReferences) {
			if (connectedNames.has(ref) && connectedNames.has(skill.name)) {
				g.setEdge(skill.name, ref);
			}
		}
	}

	dagre.layout(g);

	const nodes: Node[] = [];
	for (const name of connectedNames) {
		const nodeWithPosition = g.node(name);
		const skill = skillMap.get(name)!;
		nodes.push({
			id: name,
			position: {
				x: nodeWithPosition.x - NODE_WIDTH / 2,
				y: nodeWithPosition.y - NODE_HEIGHT / 2,
			},
			data: {
				label: skill.name,
				category: skill.category,
			},
			type: 'skillNode',
		});
	}

	const edges: Edge[] = [];
	const edgeSet = new Set<string>();
	for (const skill of skills) {
		for (const ref of skill.crossReferences) {
			if (connectedNames.has(ref) && connectedNames.has(skill.name)) {
				const edgeId = `${skill.name}->${ref}`;
				if (!edgeSet.has(edgeId)) {
					edgeSet.add(edgeId);
					edges.push({
						id: edgeId,
						source: skill.name,
						target: ref,
					});
				}
			}
		}
	}

	return { nodes, edges };
}
