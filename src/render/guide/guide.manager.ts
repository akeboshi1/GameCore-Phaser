import { Render } from "../render";

export interface IGuide {
    id: number;
    start();
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

    public startGuide(id: number) {
        const guide = this.guideMap.get(id);
        if (guide) guide.start();
    }

    public stopGuide(id: number) {
        const guide = this.guideMap.get(id);
        if (guide) guide.stop();
    }

}
