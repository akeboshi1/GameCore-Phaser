import { UiManager, Render, BasePanel, BasicScene } from "gamecoreRender";
import { AtlasData, UILoadType } from "picaRes";
import { PicaRenderUiManager } from "./pica.Renderuimanager";
export class PicaBasePanel extends BasePanel {
    protected atlasNames: Array<string | AtlasData>;
    protected textures: Array<string | AtlasData>;
    protected tempDatas: any;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
    }

    protected initResource() {
        let datas;
        if (this.atlasNames) {
            const uimanager: PicaRenderUiManager = <PicaRenderUiManager>(this.uiManager);
            datas = uimanager.getUrlDatas(this.atlasNames);

        }
        if (this.textures) {
            const uimanager: PicaRenderUiManager = <PicaRenderUiManager>(this.uiManager);
            const tempdatas = uimanager.getUrlDatas(this.textures, UILoadType.texture);
            datas = datas ? datas.concat(tempdatas) : tempdatas;
        }
        if (datas) {
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
    protected setLinear(key: string) {
        super.setLinear(key);
        if (this.atlasNames) {
            for (const atlas of this.atlasNames) {
                if (typeof atlas === "string") {
                    super.setLinear(atlas);
                } else {
                    super.setLinear(atlas.atlasName);
                }
            }
        }
    }

}
