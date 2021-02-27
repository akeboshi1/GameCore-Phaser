import { GuideManager, Render } from "gamecoreRender";
import { DialogGuide } from "./dialog.guide";
import { TaskGuide } from "./task.guide";

export class PicaGuideManager extends GuideManager {
    constructor(protected render: Render) {
        super(render);
    }

    public init(data?: any) {
        // todo test
        // this.guideMap.set(1, new TaskGuide(1, this.render));
        this.guideMap.set(2, new DialogGuide(2, this.render));
    }
}
