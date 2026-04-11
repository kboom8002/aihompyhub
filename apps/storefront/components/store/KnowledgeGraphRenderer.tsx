// @ts-nocheck
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
// @ts-ignore
import dagre from 'dagre';
import { useRouter } from 'next/navigation';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 60;

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

export default function KnowledgeGraphRenderer({ tenantSlug, apiEndpoint }: { tenantSlug: string, apiEndpoint: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fn = async () => {
       try {
          const res = await fetch(apiEndpoint);
          const data = await res.json();
          if (data.nodes && data.edges) {
             // Decorate standard nodes
             const decoratedNodes = data.nodes.map((n: any) => ({
                id: n.id,
                data: { 
                   label: (
                      <div className="flex flex-col items-center p-2 rounded-md font-sans text-sm font-bold text-white shadow-md text-center max-w-[180px]" style={{ backgroundColor: n.data.color, border: '2px solid rgba(255,255,255,0.2)' }}>
                         <span className="text-[10px] opacity-80 uppercase tracking-widest">{n.data.type}</span>
                         <span className="line-clamp-2 leading-tight mt-1">{n.data.label}</span>
                      </div>
                   ), 
                   originalType: n.data.type 
                },
                position: n.position,
                style: { border: 'none', background: 'transparent', padding: 0 }
             }));

             const decoratedEdges = data.edges.map((e: any) => ({
                ...e,
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: e.style?.stroke || '#a1a1aa',
                },
                animated: true,
                style: { stroke: e.style?.stroke || '#a1a1aa', ...e.style }
             }));

             const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                decoratedNodes,
                decoratedEdges,
                'TB' // top to bottom
             );
             setNodes(layoutedNodes);
             setEdges(layoutedEdges);
          }
       } catch (err) {
          console.error(err);
       } finally {
          setLoading(false);
       }
    };
    fn();
  }, [apiEndpoint, setNodes, setEdges]);

  const onNodeClick = useCallback((event: any, node: any) => {
     // Route based on type
     const t = node.data.originalType;
     if (t === 'expert') router.push(`/${tenantSlug}/trust/experts/${node.id}`);
     else if (t === 'trust') router.push(`/${tenantSlug}/trust/${node.id}`);
     else if (t === 'answer') router.push(`/${tenantSlug}/answers/${node.id}`);
     else if (t === 'topic' || t === 'topic_hub') router.push(`/${tenantSlug}/topics/${node.id}`);
  }, [router, tenantSlug]);

  if (loading) return <div className="flex justify-center items-center h-full w-full">지식 맵 데이터를 그리는 중입니다...</div>;

  return (
    <div className="w-full h-[80vh] border border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        minZoom={0.2}
      >
        <Background gap={24} size={2} color="#e5e7eb" />
        <Controls />
        <MiniMap zoomable pannable nodeColor={(n) => n.data?.color || '#ccc'} />
        <Panel position="top-right" className="bg-white/80 p-4 rounded-xl shadow-sm backdrop-blur text-xs">
           <h4 className="font-bold mb-2">노드 가이드 (Legend)</h4>
           <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#14b8a6]"></div> 공식 답변 (Answer)</div>
           <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div> 전문가/에디터 (Expert)</div>
           <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#22c55e]"></div> 신뢰 논문/근거 (Trust)</div>
           <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div> 주제 허브 (Topic)</div>
           <div className="text-gray-500 mt-2 italic">* 노드 클릭 시 상세 보기로 이동합니다.</div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
