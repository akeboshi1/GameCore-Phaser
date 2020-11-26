
import { BasePanel, UiManager } from "gamecoreRender";
import { op_client } from "pixelpai_proto";
import { ModuleName } from "structure";
import { PicaGiftLaterctPanel } from "./PicaGiftLaterctPanel";
import { PicaGiftPlayerPanel } from "./PicaGiftPlayerPanel";
export class PicaGiftEffectPanel extends BasePanel {

    private laterctPanel: PicaGiftLaterctPanel;
    private playerPanel: PicaGiftPlayerPanel;
    private content: Phaser.GameObjects.Container;
    private tempDataQueue: any[];
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAGIFTEFFECT_NAME;
        this.tempDataQueue = [];
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width / 2;
        this.content.y = height / 2;
        super.resize(width, height);
        this.setSize(width * this.scale, height * this.scale);

    }

    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
    }

    preload() {
        this.addAtlas(this.key, "gifteffect/gifteffect.png", "gifteffect/gifteffect.json");
        super.preload();
    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.add(this.content);
        this.laterctPanel = new PicaGiftLaterctPanel(this.scene, this.mWorld, width, height, this.key, this.dpr);
        this.playerPanel = new PicaGiftPlayerPanel(this.scene, this.mWorld, width, height, this.key, this.dpr);
        this.content.add(this.laterctPanel);
        this.content.add(this.playerPanel);
        this.resize(0, 0);
        super.init();
        this.play(undefined);
    }

    destroy() {
        super.destroy();
    }

    play(data: any[]) {
        this.tempDataQueue.push(data);
        if (!this.mInitialized) return;
        this.laterctPanel.play(this.tempDataQueue);
        this.playerPanel.play(this.tempDataQueue);
        this.tempDataQueue.length = 0;
    }
}
