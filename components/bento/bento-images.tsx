
import Masonry from '@/components/Masonry';
import { useState } from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface Item {
    id: string;
    img: string;
    url: string;
    height: number;
}

export function BentoImages({ items }: { items: Item[] }) {
  return (
    <> 
    <Masonry
      items={items}
      ease="power3.out"
      duration={0.6}
      stagger={0.05}
      animateFrom="bottom"
      scaleOnHover={true}
      hoverScale={0.95}
      blurToFocus={true}
      colorShiftOnHover={false}
    />
    </>
  )
}
