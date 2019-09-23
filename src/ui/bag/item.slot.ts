import { IItem } from "./baseitem";

export class ItemSlot implements IItem {
    public url: string;
    public id: number;
    public count: number;
    public con: Phaser.GameObjects.Container;

    private mScene: Phaser.Scene;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mResSlot: string;
    private mIcon: Phaser.GameObjects.Sprite;
    private mAnimationCon: Phaser.GameObjects.Sprite;
    private mSubScriptSprite: Phaser.GameObjects.Sprite;
    private mSubScriptRes: string;
    constructor(scene: Phaser.Scene, parentCon: Phaser.GameObjects.Container, x: number, y: number, resStr: string, respng: string, resjson: string, resSlot: string, subscriptRes?: string) {
        this.mScene = scene;
        this.con = scene.make.container(undefined, false);
        this.con.x = x;
        this.con.y = y;
        parentCon.add(this.con);
        this.mResStr = resStr;
        this.mResPng = respng;
        this.mResJson = resjson;
        this.mResSlot = resSlot;
        this.mSubScriptRes = subscriptRes;
        this.createUI();
    }

    private createUI() {
        if (!this.mScene.cache.obj.has(this.mResStr)) {
            this.mScene.load.atlas(this.mResStr, this.mResPng, this.mResJson);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    private onLoadCompleteHandler() {
        const itemBG: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        itemBG.setTexture(this.mResStr, this.mResSlot);
        this.con.addAt(itemBG, 0);
        this.con.setSize(itemBG.width, itemBG.height);
        this.mIcon = this.mScene.make.sprite(undefined, false);
        this.con.addAt(this.mIcon, 1);
        if (this.mSubScriptRes) {
            this.mSubScriptSprite = this.mScene.make.sprite(undefined, false);
            this.mSubScriptSprite.setTexture(this.mResStr, this.mSubScriptRes);
            this.mSubScriptSprite.x = this.mSubScriptSprite.width - itemBG.width >> 1;
            this.mSubScriptSprite.y = this.mSubScriptSprite.height - itemBG.height >> 1;
            this.con.addAt(this.mSubScriptSprite, 2);
        }
        this.con.setInteractive(new Phaser.Geom.Rectangle(0, 0, itemBG.width, 56), Phaser.Geom.Rectangle.Contains);
    }

}
