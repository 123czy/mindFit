'use client';

import dynamic from 'next/dynamic';
const MuuriDemo = dynamic(() => import('@/components/muuri-demo').then(mod => mod.MuuriDemo), { ssr: false });

const demoElements = [
  { id: "1", type: "text" as const, shape: "square-1x1" as const, position: { x: 0, y: 0 }, content: "Item 1", fontSize: "md" as const },
  { id: "2", type: "text" as const, shape: "square-1x1" as const, position: { x: 0, y: 0 }, content: "Item 2", fontSize: "md" as const },
]

export default function MuuriDemoPage() {
  return <MuuriDemo elements={demoElements} isEditing={true} isMobileView={false} />
}

