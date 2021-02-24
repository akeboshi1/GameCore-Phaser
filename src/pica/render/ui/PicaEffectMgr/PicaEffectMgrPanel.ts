
import { BasePanel, UiManager } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { op_client } from "pixelpai_proto";
import { ModuleName } from "structure";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaFurniUnlockEffectPanel } from "./PicaFurniUnlockEffectPanel";
import { PicaLevelUpEffectPanel } from "./PicaLevelUpEffectPanel";
export class PicaEffectMgrPanel extends PicaBasePanel {

    private content: Phaser.GameObjects.Container;
    private furniEffectPanel: PicaFurniUnlockEffectPanel;
    private levelupEffectPanel: PicaLevelUpEffectPanel;
    private tempQueue: Map<string, any[]> = new Map();
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAEFFECTMGR_NAME;
        this.atlasNames = [UIAtlasName.effectcommon, UIAtlasName.effectlevelup];
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width / 2;
        this.content.y = height / 2;
        super.resize(width, height);
        this.setSize(width, height);

    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
    }

    play(data: any[], type: string) {
        if (!this.mInitialized) {
            let arr = this.tempQueue.get(type);
            if (!arr) {
                arr = data;
            } else {
                arr = arr.concat(data);
            }
            this.tempQueue.set(type, arr);
        } else {
            if (type === "unlock") {
                if (!this.furniEffectPanel) {
                    this.furniEffectPanel = new PicaFurniUnlockEffectPanel(this.scene, this.render, this.scaleWidth, this.scaleHeight, this.key, this.dpr);
                    this.content.add(this.furniEffectPanel);
                }
                this.furniEffectPanel.visible = true;
                this.furniEffectPanel.play(data);
            } else if (type === "levelup") {
                if (!this.levelupEffectPanel) {
                    this.levelupEffectPanel = new PicaLevelUpEffectPanel(this.scene, this.scaleWidth, this.scaleHeight, this.dpr, this.scale);
                    this.content.add(this.levelupEffectPanel);
                }
                this.levelupEffectPanel.visible = true;
                this.levelupEffectPanel.setLevelUpData(data[0]);
                this.levelupEffectPanel.playAnimation();
            }
        }
    }

    protected onShow() {
        if (this.tempQueue.size > 0) {
            this.tempQueue.forEach((value, key) => {
                this.play(value, key);
            });
        }
    }
}
