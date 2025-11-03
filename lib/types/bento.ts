export type BentoShape =
  | "square-1x1" // 1x1 正方形
  | "square-2x2" // 2x2 正方形
  | "rect-1x2" // 1x2 横向矩形
  | "rect-2x1" // 2x1 纵向矩形
  | "rect-2x3" // 2x3 横向矩形
  | "rect-3x2" // 3x2 纵向矩形
  | "wide-1x3" // 1x3 宽矩形
  | "tall-3x1"; // 3x1 高矩形

export type BentoElementType =
  | "image"
  | "link"
  | "text"
  | "section"
  | "folder"
  | "stack";

export interface BaseBentoElement {
  id: string;
  type: BentoElementType;
  shape: BentoShape;
  position: { x: number; y: number };
  color?: string;
}

export interface ImageBentoElement extends BaseBentoElement {
  type: "image";
  src: string;
  alt?: string;
  url?: string;
}

export interface LinkBentoElement extends BaseBentoElement {
  type: "link";
  url: string;
  title: string;
  icon?: string;
}

export interface TextBentoElement extends BaseBentoElement {
  type: "text";
  content: string;
  fontSize?: "sm" | "md" | "lg";
  url?: string;
}

export interface SectionBentoElement extends BaseBentoElement {
  type: "section";
  title: string;
}

export interface FolderBentoElement extends BaseBentoElement {
  type: "folder";
  title: string;
  foldType: "card" | "post";
}

export interface StackBentoElement extends BaseBentoElement {
  type: "stack";
  title: string;
}

export type BentoElement =
  | ImageBentoElement
  | LinkBentoElement
  | TextBentoElement
  | SectionBentoElement
  | FolderBentoElement
  | StackBentoElement;

export const shapeConfig: Record<
  BentoShape,
  { width: number; height: number; label: string }
> = {
  "square-1x1": { width: 1, height: 1, label: "小方块" },
  "square-2x2": { width: 2, height: 2, label: "中方块" },
  "rect-1x2": { width: 2, height: 1, label: "横向矩形" },
  "rect-2x1": { width: 1, height: 2, label: "纵向矩形" },
  "rect-2x3": { width: 3, height: 2, label: "大横向矩形" },
  "rect-3x2": { width: 2, height: 3, label: "大纵向矩形" },
  "wide-1x3": { width: 3, height: 1, label: "宽矩形" },
  "tall-3x1": { width: 1, height: 3, label: "高矩形" },
};

export const availableShapes: BentoShape[] = [
  "square-1x1",
  "square-2x2",
  "rect-1x2",
  "rect-2x1",
  "rect-2x3",
  "rect-3x2",
  "wide-1x3",
  "tall-3x1",
];
