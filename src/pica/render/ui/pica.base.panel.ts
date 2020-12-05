import { UiManager, Render, BasePanel, BasicScene } from "gamecoreRender";
import { UILoadType } from "picaRes";
import { PicaRenderUiManager } from "./pica.Renderuimanager";
export class PicaBasePanel extends BasePanel {
    protected atlasNames: string[];
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
    }

    protected initResource() {
        if (this.atlasNames) {
            const uimanager: PicaRenderUiManager = <PicaRenderUiManager>(this.uiManager);
            const datas = uimanager.getAtlas(this.atlasNames);
            for (const data of datas) {
                if (data.uiType === UILoadType.atlas) {
                    this.addAtlas(data.atlasName, data.atlasUrl, data.jsonUrl);
                } else if (data.uiType === UILoadType.texture) {
                    this.addImage(data.atlasName, data.atlasUrl);
                }
            }
        }
    }

    protected preload() {
        this.initResource();
        super.preload();
    }

}
