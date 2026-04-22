'use client';

import { useCallback, useMemo } from 'react';
import {
	ReactFlow,
	type NodeProps,
	type Node,
	Handle,
	Position,
	Background,
	Controls,
	useNodesState,
	useEdgesState,
	type ColorMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';
import type { Skill } from '@/lib/types';
import { buildGraphData } from '@/lib/graph';
import { Badge } from '@/components/ui/badge';

interface SkillGraphViewProps {
	skills: Skill[];
	onNodeClick: (skillName: string) => void;
}

function SkillNode({
	data,
}: NodeProps<Node<{ label: string; category: string }>>) {
	return (
		<div className="flex flex-col items-center gap-1 rounded-lg border bg-card px-3 py-2 shadow-sm ring-1 ring-border/50 transition-shadow hover:shadow-md">
			<Handle
				type="target"
				position={Position.Left}
				className="size-1.5! border-primary! bg-primary!"
			/>
			<span className="text-xs font-medium text-card-foreground">
				{data.label}
			</span>
			<Badge variant="secondary" className="text-[0.5rem]">
				{data.category}
			</Badge>
			<Handle
				type="source"
				position={Position.Right}
				className="size-1.5! border-primary! bg-primary!"
			/>
		</div>
	);
}

const nodeTypes = { skillNode: SkillNode };

export function SkillGraphView({ skills, onNodeClick }: SkillGraphViewProps) {
	const graphData = useMemo(() => buildGraphData(skills), [skills]);
	const { resolvedTheme } = useTheme();

	const [nodes, , onNodesChange] = useNodesState(graphData.nodes);
	const [edges, , onEdgesChange] = useEdgesState(graphData.edges);

	const handleNodeClick = useCallback(
		(_: React.MouseEvent, node: Node) => {
			onNodeClick(node.id);
		},
		[onNodeClick],
	);

	if (graphData.nodes.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
				<p className="text-sm font-medium text-muted-foreground">
					No skill dependencies found
				</p>
				<p className="text-xs text-muted-foreground/80">
					Skills that reference each other will appear here as a
					visual graph.
				</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={handleNodeClick}
				nodeTypes={nodeTypes}
				colorMode={(resolvedTheme as ColorMode) ?? 'system'}
				fitView
				minZoom={0.3}
				maxZoom={2}
				proOptions={{ hideAttribution: true }}
			>
				<Background gap={16} size={1} />
				<Controls showInteractive={false} />
			</ReactFlow>
		</div>
	);
}
