import { Render } from "../render";

export interface IGuide {
    id: number;
    start(data?: any);
    stop();
    destroy();
}

export class GuideManager {
    protected guideMap: Map<number, IGuide>;
    constructor(protected render: Render) {
        this.guideMap = new Map();
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
        if (guide) guide.start(data);
    }

    public stopGuide(id: number) {
        const guide = this.guideMap.get(id);
        if (guide) guide.stop();
    }

}
