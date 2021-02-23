import { GuideManager, Render } from "gamecoreRender";
import { TaskGuide } from "./task.guide";

export class PicaGuideManager extends GuideManager {
    constructor(protected render: Render) {
        super(render);
    }

    public init(data?: any) {
        // todo test
        const guide = new TaskGuide(1, this.render);
        this.guideMap.set(guide.id, guide);
    }
}
