import { WorldService } from "../../../game/world.service";
import { Pos } from "../../../utils/pos";

/**
 * 多帧资源按钮
 */
export class IconBtn extends Phaser.GameObjects.Container {
    private monClick: Function;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mBgResKey: string;
    private mBtnBg: Phaser.GameObjects.Image;
    private mBtnIcon: Phaser.GameObjects.Image;
    private mBtnData: any;
    private mBasePos: Pos;
    private mBgTexture: string[];
    constructor(scene: Phaser.Scene, world: WorldService, bgResKey: string, bgTexture: string[], texture: string, scale: number = 28 / 43) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        this.mBtnBg = scene.make.image(undefined, false);
        this.mBgTexture = bgTexture;
        this.mBgResKey = bgResKey;
        this.mBtnBg.setTexture(bgResKey, bgTexture[0]);
        this.mBtnBg.scaleX = this.mBtnBg.scaleY = scale;
        this.addAt(this.mBtnBg, 0);

        if (texture && texture.length > 0) {
            this.mBtnIcon = scene.make.image(undefined, false);
            this.mBtnIcon.setTexture(bgResKey, texture);
            this.add(this.mBtnIcon);
        }

        this.setSize(this.mBtnBg.width, this.mBtnBg.height);
        this.setInteractive();
        this.on("pointerup", this.upHandler, this);
        this.on("pointerdown", this.downHandler, this);
        this.on("pointerover", this.overHandler, this);
        this.on("pointerout", this.outHandler, this);
    }

    public setPos(x: number, y: number) {
        if (!this.mBasePos) {
            this.mBasePos = new Pos();
        }
        this.mBasePos.x = x;
        this.mBasePos.y = y;
    }

    /**
     * 获取按钮的初始化时的位置，用于tween时，按钮来回切换位置用
     */
    public getPos(): Pos {
        return this.mBasePos;
    }

    public setBtnData(value: any) {
        this.mBtnData = value;
    }

    public getBtnData(): any {
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

    private overHandler(pointer) {
        if (this.mBgTexture.length < 2) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[1]);
    }

    private outHandler(pointer) {
        if (this.mBgTexture.length < 2) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[0]);
    }

    private upHandler() {
        if (this.monClick) {
            this.monClick();
        }
        if (this.mBgTexture.length < 3) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[2]);
    }

    private downHandler() {
        this.scaleHandler();
        if (this.mBgTexture.length < 4) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[3]);
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
