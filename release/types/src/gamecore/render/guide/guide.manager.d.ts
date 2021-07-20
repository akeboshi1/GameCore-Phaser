import { Render } from "../render";
export interface IGuide {
    id: number;
    guideID: number;
    show(data?: any): any;
    hide(): any;
    checkInteractive(data?: any): boolean;
    destroy(): any;
}
export declare class GuideManager {
    protected render: Render;
    protected mGurGuide: IGuide;
    protected guideMap: Map<number, IGuide>;
    constructor(render: Render);
    get curGuide(): IGuide;
    canInteractive(data?: any): boolean;
    init(data?: any): void;
    destroy(): void;
    startGuide(guide: IGuide): void;
    stopGuide(): void;
}
