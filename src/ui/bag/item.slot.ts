import { IItem } from "./baseitem";
import { IListItemComponent } from "./IListItemRender";
import { op_gameconfig } from "pixelpai_proto";
import { DragDropIcon } from "./dragDropIcon";

export class ItemSlot implements IListItemComponent {
    // public url: string;
    // public id: number;
    // public count: number;
    public con: Phaser.GameObjects.Container;
    public index: number;
    private mData: op_gameconfig.Item;
    private mScene: Phaser.Scene;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mResSlot: string;
    private mIcon: DragDropIcon;
    private mAnimationCon: Phaser.GameObjects.Sprite;
    private mSubScriptSprite: Phaser.GameObjects.Sprite;
    private mSubScriptRes: string;
    private itemBG: Phaser.GameObjects.Sprite;
    private mSelectSprite: Phaser.GameObjects.Sprite;
    private mSelectRes: string;
    constructor(scene: Phaser.Scene, parentCon: Phaser.GameObjects.Container, x: number, y: number, resStr: string, respng: string, resjson: string, resSlot: string, selectRes?: string, subscriptRes?: string) {
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
        this.mSelectRes = selectRes;
        this.createUI();
    }

    public getView(): any {
        return this.con;
    }

    public dataChange(val: any) {
        this.mData = val;
        if (this.mIcon && this.mData && this.mData.display) {
            this.mIcon.load(this.mData.display.texturePath, this, () => {
                this.mIcon.visible = true;
            });
            const des = this.mData.des ? "\n" + this.mData.des : "";
            //  this.setToolTipText(this.data.name + des);
        }

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
        this.itemBG = this.mScene.make.sprite(undefined, false);
        this.itemBG.setTexture(this.mResStr, this.mResSlot);
        this.con.addAt(this.itemBG, 0);
        this.con.setSize(this.itemBG.width, this.itemBG.height);
        this.mIcon = new DragDropIcon(this.mScene, 0, 0);
        this.mIcon.visible = false;
        // this.mIcon.icon.anchor.set(0.5, 0.5);
        // this.mIcon.x = 26;
        // this.mIcon.y = 26;
        this.con.addAt(this.mIcon, 1);
        if (this.mSubScriptRes) {
            this.mSubScriptSprite = this.mScene.make.sprite(undefined, false);
            this.mSubScriptSprite.setTexture(this.mResStr, this.mSubScriptRes);
            this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.itemBG.width >> 1;
            this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.itemBG.height >> 1;
            this.con.addAt(this.mSubScriptSprite, 2);
        }
        this.con.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.itemBG.width, 56), Phaser.Geom.Rectangle.Contains);
        this.con.on("pointerover", this.overHandler, this);
        this.con.on("pointerout", this.outHandler, this);
    }

    private overHandler(pointr) {
        if (this.mSelectRes && this.mSelectRes.length > 0) {
            this.mSelectSprite = this.mScene.make.sprite(undefined, false);
            this.mSelectSprite.setTexture(this.mResStr, this.mSelectRes);
            this.con.add(this.mSelectSprite);
        }
        // this.itemBG.alpha = 0.5; // setTint(0xffcc00);
    }

    private outHandler(pointr) {
        if (this.mSelectSprite && this.mSelectSprite.parentContainer) {
            this.mSelectSprite.parentContainer.remove(this.mSelectSprite);
        }
        // this.itemBG.alpha = 1;
        // this.itemBG.clearTint();
    }

}
