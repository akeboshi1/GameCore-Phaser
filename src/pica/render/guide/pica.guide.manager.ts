import { GuideManager, Render } from "gamecoreRender";
export class PicaGuideManager extends GuideManager {
    constructor(protected render: Render) {
        super(render);
    }

    public stopGuide() {
        const guideID = this.mGurGuide.guideID;
        this.render.mainPeer.stopGuide(guideID);
        super.stopGuide();
    }
}
