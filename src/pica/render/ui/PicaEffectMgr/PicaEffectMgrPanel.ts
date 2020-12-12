
import { BasePanel, UiManager } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { op_client } from "pixelpai_proto";
import { ModuleName } from "structure";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaFurniUnlockEffectPanel } from "./PicaFurniUnlockEffectPanel";
export class PicaEffectMgrPanel extends PicaBasePanel {

    private content: Phaser.GameObjects.Container;
    private furniEffectPanel: PicaFurniUnlockEffectPanel;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAEFFECTMGR_NAME;
        this.atlasNames = [UIAtlasName.effectcommon];
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width / 2;
        this.content.y = height / 2;
        super.resize(width, height);
        this.setSize(width * this.scale, height * this.scale);

    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.add(this.content);
        this.furniEffectPanel = new PicaFurniUnlockEffectPanel(this.scene, this.render, width, height, this.key, this.dpr);
        this.content.add(this.furniEffectPanel);
        this.resize(0, 0);
        super.init();
        this.play(undefined, "unlock");
    }

    destroy() {
        super.destroy();
    }

    play(data: any[], type: string) {
        if (!this.mInitialized) return;
        if (type === "unlock") {
            this.furniEffectPanel.play(data);
        }
    }
}
