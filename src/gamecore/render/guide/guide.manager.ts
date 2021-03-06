import { Render } from "../render";

export interface IGuide {
    id: number;
    guideID: number;
    show(data?: any);
    hide();
    checkInteractive(data?: any): boolean;
    destroy();
}

export class GuideManager {
    protected mGurGuide: IGuide;
    protected guideMap: Map<number, IGuide>;
    constructor(protected render: Render) {
        this.guideMap = new Map();
    }

    public get curGuide(): IGuide {
        return this.mGurGuide;
    }

    public canInteractive(data?: any): boolean {
        if (!this.mGurGuide) return false;
        const boo = data ? this.mGurGuide.checkInteractive(data) : true;
        return boo;
    }

    public init(data?: any) {
    }

    public destroy() {
        this.guideMap.forEach((guide) => {
            guide.destroy();
        });
        this.guideMap.clear();
        this.guideMap = null;
    }

    public startGuide(guide: IGuide) {
        this.mGurGuide = guide;
    }

    public stopGuide() {
        this.mGurGuide = null;
    }
}
