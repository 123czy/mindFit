declare module "muuri" {
  export interface MuuriOptions {
    items?: string | Element[];
    dragEnabled?: boolean;
    layout?: any;
    dragContainer?: Element | null;
    dragStartPredicate?: any;
    dragRelease?: any;
    dragPlaceholder?: any;
    [key: string]: any;
  }

  export default class Muuri {
    constructor(element: Element | string, options?: MuuriOptions);
    add(elements: Element | Element[], options?: any): void;
    remove(elements: Element | Element[], options?: any): void;
    show(elements: Element | Element[], options?: any): void;
    hide(elements: Element | Element[], options?: any): void;
    refreshItems(): void;
    refreshSortData(): void;
    layout(immediate?: boolean): void;
    sort(comparer?: any, options?: any): void;
    on(event: string, handler: (...args: any[]) => void): void;
    destroy(): void;
  }
}
