import {Panel} from "../components/panel";
import {Border, Url} from "../../utils/resUtil";
import {NinePatch} from "../components/nine.patch";

export class DecoratePanel extends Panel {
    private readonly resKey = "decorate";
    private mControllContainer: Phaser.GameObjects.Container;
    private mTurnBtn: Phaser.GameObjects.Image;
    private mPutBtn: Phaser.GameObjects.Image;
    private mConfirmBtn: Phaser.GameObjects.Image;

    private mArrow1: Phaser.GameObjects.Image;
    private mArrow3: Phaser.GameObjects.Image;
    private mArrow5: Phaser.GameObjects.Image;
    private mArrow7: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene) {
        super(scene, null);
        this.setTween(false);
    }

    public setElement(ele) {

    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.atlas(this.resKey, Url.getRes("ui/decorate/decorate_atlas.png"), Url.getRes("ui/decorate/decorate_atlas.json"));
        super.preload();
    }

    protected init() {
        this.mControllContainer = this.scene.make.container(undefined, false);
        const border = new NinePatch(this.scene, 98, 35, 196, 70, Border.getName(), null, Border.getConfig());

        this.mTurnBtn = this.createImage(this.resKey, "turn_btn.png", 38, 35);
        this.mPutBtn = this.createImage(this.resKey, "put_btn.png", 98, 35);
        this.mConfirmBtn = this.createImage(this.resKey, "confirm_btn.png", 155, 35);

        this.mArrow1 = this.createImage(this.resKey, "dir_1.png", 0, 100);
        this.mArrow3 = this.createImage(this.resKey, "dir_3.png", 0, 300);
        this.mArrow5 = this.createImage(this.resKey, "dir_1.png", 300, 300).setScale(-1);
        this.mArrow7 = this.createImage(this.resKey, "dir_3.png", 300, 100).setScale(-1);

        this.add([this.mControllContainer, this.mArrow1, this.mArrow3, this.mArrow5, this.mArrow7]);
        this.mControllContainer.add([border, this.mTurnBtn, this.mPutBtn, this.mConfirmBtn]);
        super.init();

        this.x = 700;
        this.y = 300;
    }

    private createImage(key: string, frame?: string, x?: number, y?: number): Phaser.GameObjects.Image {
        return this.scene.make.image({ key, frame, x, y }, false);
    }
}
