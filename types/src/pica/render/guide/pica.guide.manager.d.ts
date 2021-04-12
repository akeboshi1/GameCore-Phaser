import { GuideManager, Render } from "gamecoreRender";
export declare class PicaGuideManager extends GuideManager {
    protected render: Render;
    constructor(render: Render);
    stopGuide(): void;
}
