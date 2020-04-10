import { BasePanel } from "../components/BasePanel";
import { Url } from "../../utils/resUtil";
import { Font } from "../../utils/font";
import { WorldService } from "../../game/world.service";

export class ControlFPanel extends BasePanel {
    private mControlText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
    }

    show(param?: any) {
        super.show(param);
        this.on("pointerdown", this.onMouseDownHandler, this);
        this.on("pointerup", this.onMouseUpHandler, this);
    }

    hide() {
        this.off("pointerdown", this.onMouseDownHandler, this);
        this.off("pointerup", this.onMouseUpHandler, this);
        super.hide();
    }

    resize(wid: number = 0, hei: number = 0) {
        if (!this.mScene) return;
        const worldView = this.mScene.cameras.main.worldView;
        this.x = worldView.x + (worldView.width >> 1);
        this.y = worldView.y + (worldView.height >> 1);
    }

    destroy() {
        if (this.mControlText) this.mControlText.destroy(true);
        super.destroy();
    }

    protected preload() {
        this.mScene.load.image("controlF_background", Url.getRes("ui/controlf/background.png"));
        super.preload();
    }

    protected init() {
        if (!this.mScene) return;
        const image = this.mScene.make.image({
            key: "controlF_background"
        }, false);
        this.add(image);

        // TODO 不一定是F
        this.mControlText = this.mScene.make.text({
            align: "center",
            text: "F",
            style: { font: Font.YAHEI_20_BOLD }
        }, false);
        this.mControlText.x = -(this.mControlText.width >> 1);
        this.mControlText.y = -(this.mControlText.height >> 1);
        this.add(this.mControlText);

        this.setSize(image.width, image.height);
        this.setInteractive();
        super.init();

        this.resize();
    }

    private onMouseDownHandler() {
        this.scale = 0.8;
    }

    private onMouseUpHandler() {
        this.scale = 1;
        this.emit("control");
    }
}
