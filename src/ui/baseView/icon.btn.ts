import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { DynamicImage } from "../components/dynamic.image";

export class IconBtn extends Phaser.GameObjects.Container {
    private monClick: Function;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mBtnBg: Phaser.GameObjects.Image;
    private mBtnIcon: DynamicImage;
    private mBtnData: any;
    constructor(scene: Phaser.Scene, world: WorldService, bgResKey: string, bgTexture: string, texture: string, data?: any) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        this.mBtnBg = scene.make.image(undefined, false);
        this.mBtnBg.setTexture(bgResKey, bgTexture);
        this.mBtnBg.scaleX = this.mBtnBg.scaleY = 28 / 43;
        this.addAt(this.mBtnBg, 0);

        this.mBtnIcon = new DynamicImage(scene, 0, 0);
        this.add(this.mBtnIcon);
        this.mBtnIcon.load(Url.getOsdRes(texture));

        this.mBtnData = data;

        this.setSize(this.mBtnBg.width, this.mBtnBg.height);
        this.setInteractive();
        this.on("pointerup", this.clickHandler, this);
    }

    public getBtnDaa(): any {
        return this.mBtnData;
    }

    public setClick(func: Function) {
        this.monClick = func;
    }

    public destroy() {
        if (this.mBtnBg) {
            this.mBtnBg.destroy(true);
        }
        if (this.mBtnIcon) {
            this.mBtnIcon.destroy(true);
        }
        this.monClick = null;
        this.mBtnBg = null;
        this.mBtnIcon = null;
        this.mBtnData = null;
        this.mScene = null;
        super.destroy();
    }

    private clickHandler() {
        if (this.monClick) {
            this.monClick();
        }
        this.scaleHandler();
    }

    private scaleHandler() {
        this.mScene.tweens.add({
            targets: this,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        this.scaleX = this.scaleY = 1;
    }
}
