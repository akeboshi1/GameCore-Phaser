import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { DynamicImage } from "../components/dynamic.image";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { NinePatch } from "../components/nine.patch";
import { NinePatchButton } from "../components/ninepatch.button";
import { Url } from "../../utils/resUtil";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { Handler } from "../../Handler/Handler";
export class CutInMenuPanel extends BasePanel {
    private key: string = "cutinmenupanel";
    private rightPopButton: RightPopContainer;
    private mapPop: Map<any, any> = new Map();
    private world: WorldService;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.world = world;
    }

    resize(width: number, height: number) {
        super.resize(width, height);
        this.setSize(width, height);
    }

    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
    }

    addListen() {
        if (!this.mInitialized) return;
    }

    removeListen() {
        if (!this.mInitialized) return;
    }

    preload() {
        this.addAtlas(this.key, "cutInmenu/cutInmenu.png", "cutInmenu/cutInmenu.json");
        super.preload();
    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.rightPopButton = new RightPopContainer(this.scene, this.key, this.dpr);
        const posx = width + this.rightPopButton.width * 0.5;
        this.rightPopButton.setPosition(posx, height * 0.5);
        this.rightPopButton.setClickHandler(new Handler(this, this.onRightClickHandler));
        this.add(this.rightPopButton);
        this.resize(width, height);
        super.init();
        this.openRightPopUI();
    }

    destroy() {
        super.destroy();
    }

    public openRightPopUI() {
        const width = this.scaleWidth;
        const posx = width + this.rightPopButton.width * 0.5;
        if (this.mapPop.has(this.rightPopButton)) {
            const timeid = this.mapPop.get(this.rightPopButton);
            clearTimeout(timeid);
            this.mapPop.delete(this.rightPopButton);
        } else {
            const posTx = width - 15 * this.dpr;
            const target = this.rightPopButton;
            this.rightPopButton.x = posx;
            this.scene.tweens.add({
                targets: target,
                x: { value: posTx, duration: 300, ease: "Bounce.easeOut" }
            });
        }
        const timeID = setTimeout(() => {
            this.rightPopButton.visible = false;
            this.mapPop.delete(this.rightPopButton);
            this.rightPopButton.x = posx;
            this.emit("hide");
        }, 8000);
        this.mapPop.set(this.rightPopButton, timeID);
    }

    private onRightClickHandler() {
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData[0];
        this.emit("rightButton", data.id, data.button[0].node.id);
    }

}

class RightPopContainer extends Phaser.GameObjects.Container {
    private readonly dpr: number;
    private readonly key: string;
    private minecarBtn: Button;
    private teximg: Phaser.GameObjects.Image;
    private clickHandler: Handler;
    private popData: any;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        const minecarbg = this.scene.make.image({ key: this.key, frame: "minebag_bg" });
        this.minecarBtn = new Button(this.scene, this.key, "minecar", "minecar");
        this.minecarBtn.setPosition(-12 * dpr, -this.minecarBtn.height * 0.5);
        this.teximg = this.scene.make.image({ key: this.key, frame: "text_minebag" });
        this.teximg.setPosition(this.minecarBtn.x, 2 * dpr);
        this.add([minecarbg, this.minecarBtn, this.teximg]);
        this.minecarBtn.on("Tap", this.onClickHandler, this);
        this.setSize(minecarbg.width, minecarbg.height);
    }
    public setClickHandler(handler: Handler) {
        this.clickHandler = handler;
    }
    public setPopData(data: any) {
        this.popData = data;
    }
    private onClickHandler() {
        if (this.clickHandler) this.clickHandler.runWith(this.popData);
    }
}
