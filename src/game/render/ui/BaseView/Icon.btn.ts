import { WorldService } from "../../world.service";
import { Pos } from "../../../../utils/pos";
import { Url } from "../../../../utils/resUtil";

export interface IBtnData {
    readonly name?: string;
    key: string;
    bgResKey: string;
    bgTextures: string[];
    iconResKey: string;
    iconTexture: string;
    scale: number;
    pngUrl: string;
    jsonUrl: string;
    callBack?: Function;
}
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
    private mData: IBtnData;
    // // 按钮打开模块的name，用于打开和关闭此模块及模块更新时，主界面按钮的更新（显示和隐藏）
    // private medName: string;
    constructor(scene: Phaser.Scene, world: WorldService, data: IBtnData) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        this.mBtnBg = scene.make.image(undefined, false);
        this.mBgResKey = data.bgResKey;
        this.mBgTexture = data.bgTextures;
        this.mData = data;
        if (!this.mScene.textures.exists(this.mBgResKey) && data.pngUrl && data.jsonUrl) {
            this.mScene.load.atlas(data.key, Url.getRes(data.pngUrl), Url.getRes(data.jsonUrl));
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
            this.mScene.load.start();
            return;
        }
        this.loadComplete();
    }

    // public setMedName(name: string) {
    //     this.medName = name;
    // }

    public getKey(): string {
        return this.mData.key;
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

    protected loadComplete() {
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[0]);
        this.mBtnBg.scaleX = this.mBtnBg.scaleY = this.mData.scale;
        this.addAt(this.mBtnBg, 0);
        if (this.mData.iconResKey && this.mData.iconTexture && this.mData.iconTexture.length > 0) {
            this.mBtnIcon = this.mScene.make.image(undefined, false);
            this.mBtnIcon.setTexture(this.mData.iconResKey, this.mData.iconTexture);
            this.add(this.mBtnIcon);
        }
        this.setSize(this.mBtnBg.width, this.mBtnBg.height);
        this.setInteractive();
        this.on("pointerup", this.upHandler, this);
        this.on("pointerdown", this.downHandler, this);
        this.on("pointerover", this.overHandler, this);
        this.on("pointerout", this.outHandler, this);
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
        if (this.mData && this.mData.callBack) {
            this.mData.callBack.apply(this);
        }
        this.emit("click", this);
        if (this.mBgTexture.length < 3) {
            return;
        }
        this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[2]);
    }

    private downHandler() {
        // this.scaleHandler();
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
