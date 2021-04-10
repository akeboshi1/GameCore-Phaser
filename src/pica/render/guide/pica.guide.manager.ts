import { GuideManager, Render } from "gamecoreRender";
export class PicaGuideManager extends GuideManager {
    constructor(protected render: Render) {
        super(render);
    }

    public stopGuide() {
        if (!this.mGurGuide) return;
        const guideID = this.mGurGuide.guideID;
        this.render.mainPeer.stopGuide(guideID);
        super.stopGuide();
    }
}
