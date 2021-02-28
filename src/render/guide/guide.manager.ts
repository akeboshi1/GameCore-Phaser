import { Render } from "../render";

export interface IGuide {
    id: number;
    start(data?: any);
    stop();
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
        return this.mGurGuide.checkInteractive(data);
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

    public startGuide(id: number, data?: any) {
        const guide = this.guideMap.get(id);
        if (guide) {
            this.mGurGuide = guide;
            guide.start(data);
        }
    }

    public stopGuide(id: number) {
        const guide = this.guideMap.get(id);
        if (guide) {
            this.mGurGuide = null;
            guide.stop();
        }
    }

}
