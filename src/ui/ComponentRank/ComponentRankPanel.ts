import { BasicRankPanel } from "../Rank/BasicRankPanel";
import { WorldService } from "../../game/world.service";
import { CloseButton } from "../../utils/resUtil";
import { ComponentRankMediator } from "./ComponentRankMediator";

export class ComponentRankPanel extends BasicRankPanel {
    private mCloseBtn: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, worldService: WorldService) {
        super(scene, worldService);
    }

    resize(wid: number, hei: number) {
        if (!this.scene) return;
        const view = this.scene.cameras.main.worldView;
        this.x = view.width - this.width - wid >> 1;
        this.y = view.height - this.height - hei >> 1;
    }

    destroy() {
        if (this.mCloseBtn) {
            this.mCloseBtn.destroy(true);
            this.mCloseBtn = null;
        }
        super.destroy();
    }

    protected preload() {
        this.scene.load.spritesheet(CloseButton.getName(), CloseButton.getPNG(), CloseButton.getFrameConfig());
        super.preload();
    }

    protected init() {
        this.mCloseBtn = this.mScene.make.image({
            x: 0,
            y: 0,
            key: CloseButton.getName(),
            frame: "btn_normal"
        }, false);
        this.mCloseBtn.setTexture(CloseButton.getName(), "btn_normal");
        this.mCloseBtn.x = (this.mWidth >> 1) - 65;
        this.mCloseBtn.y = (-this.mHeight >> 1);
        super.init();
        this.add(this.mCloseBtn);
        this.mCloseBtn.setInteractive();
        this.mCloseBtn.once("pointerup", this.onCloseHandler, this);
        (this.mWorld.uiManager.getMediator(ComponentRankMediator.NAME) as ComponentRankMediator).resize();
        this.mCloseBtn.x = this.width - 18;
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) (this.mWorld.uiManager.getMediator(ComponentRankMediator.NAME) as ComponentRankMediator).resize();
    }

    private onCloseHandler() {
        this.hide();
    }
}
