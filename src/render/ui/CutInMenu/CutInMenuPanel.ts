import { op_client } from "pixelpai_proto";
import { BasePanel } from "../Components/BasePanel";import { WorldService } from "../../world.service";
import { Handler } from "../../../utils/Handler";
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
        this.rightPopButton = new RightPopContainer(this.scene, width, this.key, this.dpr);
        const posx = width + this.rightPopButton.width * 0.5 - 15 * this.dpr;
        const bounds = this.getActivityBounds();
        if (bounds) {
            this.rightPopButton.setPosition(posx, bounds.bottom + this.rightPopButton.height);
        } else {
            this.rightPopButton.setPosition(posx, height * 0.5);
        }
        this.rightPopButton.setClickHandler(new Handler(this, this.onRightClickHandler));
        this.add(this.rightPopButton);
        this.resize(width, height);
        super.init();
        this.opneButton();
    }

    destroy() {
        super.destroy();
    }
    public opneButton() {
        this.rightPopButton.onTakeBack();
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData[0];
        const button = data.button[0];
        if (button.text === "work") {
            this.rightPopButton.setIconFrame("work");
        } else if (button.text === "minecar") {
            this.rightPopButton.setIconFrame("minecar");
        }
    }
    private onRightClickHandler() {
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData[0];
        const button = data.button[0];
        if (button.text === "work") {
            this.emit("openmed", "PicWork");
        } else if (button.text === "minecar") {
            this.emit("openmed", "MineCar");
        }
    }

    private getActivityBounds() {
        const mMediator = this.world.uiManager.getMediator("ActivityMediator");
        let bounds: Phaser.Geom.Rectangle;
        if (mMediator) bounds = mMediator.getView().getBounds();
        return bounds;
    }

}

class RightPopContainer extends Phaser.GameObjects.Container {
    public isPop: boolean = false;
    private readonly dpr: number;
    private readonly key: string;
    private minecar: Phaser.GameObjects.Image;
    private teximg: Phaser.GameObjects.Image;
    private bgSprite: Phaser.GameObjects.Image;
    private clickHandler: Handler;
    private popData: any;
    private scaleWidth: number;
    private isPlaying: boolean = false;
    private timeID: any;
    private tween: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, width: number, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.scaleWidth = width;
        const minecarbg = this.scene.make.image({ key: this.key, frame: "minebag_bg" });
        this.bgSprite = this.scene.make.image({ key: this.key, frame: "minebag_bg_brth" }, false);
        this.minecar = this.scene.make.image({ key: this.key, frame: "minecar" });// new Button(this.scene, this.key, "minecar", "minecar");
        this.minecar.setPosition(-12 * dpr, -this.minecar.height * 0.5);
        this.teximg = this.scene.make.image({ key: this.key, frame: "text_minebag" });
        this.teximg.setPosition(this.minecar.x, 2 * dpr);
        const arrow = this.scene.make.image({ key: this.key, frame: "arow" });
        // arrow.setPosition(-minecarbg.width * 0.5 + 10 * dpr, 0);
        const arrowcon = scene.make.container(undefined, false);
        arrowcon.setSize(25 * dpr, 31 * dpr);
        arrowcon.add(arrow);
        arrowcon.setPosition(-minecarbg.width * 0.5 + 10 * dpr, 0);
        this.add([this.bgSprite, minecarbg, this.minecar, this.teximg, arrowcon]);
        minecarbg.on("pointerup", this.onClickHandler, this);
        minecarbg.setInteractive();
        arrowcon.on("pointerup", this.onTakeBack, this);
        arrowcon.setInteractive();
        this.setSize(minecarbg.width, minecarbg.height);

        this.tween = this.scene.tweens.add({
            targets: this.bgSprite,
            alpha: { value: 0, duration: 500, ease: "Power1", yoyo: true },
            repeat: -1
        });
    }
    public setClickHandler(handler: Handler) {
        this.clickHandler = handler;
    }
    public setIconFrame(frame: string) {
        this.minecar.setFrame(frame);
    }
    public setPopData(data: any) {
        this.popData = data;
    }

    public play() {
        // this.bgSprite.play("minecarFrame");
        this.bgSprite.alpha = 1;
        this.tween.resume();
        this.isPop = false;
    }

    public stop() {
        // this.bgSprite.anims.remove();
        this.tween.pause();
        this.bgSprite.alpha = 0;
        this.isPop = true;
    }
    public onClickHandler() {
        if (this.clickHandler) this.clickHandler.runWith(this.popData);
    }

    public onTakeBack() {
        if (!this.isPlaying && !this.isPop) {
            this.popAnim();
        } else if (!this.isPlaying && this.isPop) {
            this.takeback();
        }
    }
    private popAnim() {
        this.isPlaying = true;
        const posTx = this.scaleWidth - 15 * this.dpr;
        const target = this;
        this.scene.tweens.add({
            targets: target,
            x: { value: posTx, duration: 300, ease: "Bounce.easeOut" },
            onComplete: () => {
                target.stop();
                target.isPlaying = false;
            }
        });
    }

    private takeback() {
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        this.isPlaying = true;
        const posx = this.scaleWidth + this.width * 0.5 - 15 * this.dpr;
        const target = this;
        this.scene.tweens.add({
            targets: target,
            x: { value: posx, duration: 300, ease: "Bounce.easeOut" },
            onComplete: () => {
                target.play();
                target.isPlaying = false;
            }
        });
    }
}
