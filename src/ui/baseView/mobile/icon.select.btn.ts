import { WorldService } from "../../../game/world.service";
import { Pos } from "../../../utils/pos";

/**
 * 切换状态按钮
 */
export class IconSelectBtn extends Phaser.GameObjects.Container {
    private monClick: Function;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mBgResKey: string;
    private mBtnBg: Phaser.GameObjects.Image;
    private mBtnIcon: Phaser.GameObjects.Image;
    private mBtnData: any;
    private mBasePos: Pos;
    private mBgTexture: string[];
    constructor(scene: Phaser.Scene, world: WorldService, bgResKey: string, bgTexture: string[], scale: number = 28 / 43) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        this.mBtnBg = scene.make.image(undefined, false);
        this.mBgTexture = bgTexture;
        this.mBgResKey = bgResKey;
        this.mBtnBg.setTexture(bgResKey, bgTexture[0]);
        this.mBtnBg.scaleX = this.mBtnBg.scaleY = scale;
        this.addAt(this.mBtnBg, 0);

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

    public setBgRes(index: number) {
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[index] || 0);
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
    }

    private outHandler(pointer) {
    }

    private upHandler() {
        if (this.monClick) {
            this.monClick();
        }
    }

    private downHandler() {
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
