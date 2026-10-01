/**
 * Declarations for page-flip 2.0.7, which ships its TypeScript sources but no
 * .d.ts files. Only the surface the monograph uses is declared, and every
 * signature here was read from node_modules/page-flip/src rather than guessed.
 */
declare module "page-flip" {
  export type FlipCorner = "top" | "bottom";
  export type Orientation = "portrait" | "landscape";
  export type FlippingState = "user_fold" | "fold_corner" | "flipping" | "read";

  export interface FlipSetting {
    startPage: number;
    size: "fixed" | "stretch";
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    drawShadow: boolean;
    flippingTime: number;
    usePortrait: boolean;
    startZIndex: number;
    autoSize: boolean;
    maxShadowOpacity: number;
    showCover: boolean;
    mobileScrollSupport: boolean;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    swipeDistance: number;
    showPageCorners: boolean;
    disableFlipByClick: boolean;
  }

  export interface WidgetEvent<T> {
    data: T;
    object: PageFlip;
  }

  export class PageFlip {
    constructor(element: HTMLElement, setting: Partial<FlipSetting>);

    /** Moves the given elements into page-flip's own container. */
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void;
    updateFromHtml(items: HTMLElement[] | NodeListOf<HTMLElement>): void;

    /** Removes its handlers AND the root element passed to the constructor. */
    destroy(): void;
    update(): void;

    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    flip(page: number, corner?: FlipCorner): void;

    turnToNextPage(): void;
    turnToPrevPage(): void;
    turnToPage(page: number): void;

    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): Orientation;
    getState(): FlippingState;
    getBoundsRect(): { left: number; top: number; width: number; height: number; pageWidth: number };

    /** The drag primitives page-flip's own pointer handlers call, in block coordinates. */
    startUserTouch(pos: { x: number; y: number }): void;
    userMove(pos: { x: number; y: number }, isTouch: boolean): void;
    userStop(pos: { x: number; y: number }, isSwipe?: boolean): void;

    on(event: "flip", callback: (e: WidgetEvent<number>) => void): PageFlip;
    on(event: "changeOrientation", callback: (e: WidgetEvent<Orientation>) => void): PageFlip;
    on(event: "changeState", callback: (e: WidgetEvent<FlippingState>) => void): PageFlip;
    on(
      event: "init" | "update",
      callback: (e: WidgetEvent<{ page: number; mode: Orientation }>) => void,
    ): PageFlip;
    off(event: string): void;
  }
}
