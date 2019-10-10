import { IListItemComponent } from "./IListItemRender";
import { op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { DragDropIcon } from "./dragDropIcon";
import { WorldService } from "../../game/world.service";
import { PlayerDataModel } from "../../service/player/playerDataModel";
import { PBpacket } from "net-socket-packet";

export class ItemSlot implements IListItemComponent {
    // public url: string;
    // public id: number;
    // public count: number;
    public con: Phaser.GameObjects.Container;
    public index: number;
    protected mData: op_gameconfig.Item;
    protected mScene: Phaser.Scene;
    protected mResStr: string;
    protected mResPng: string;
    protected mResJson: string;
    protected mResSlot: string;
    protected mIcon: DragDropIcon;
    protected mAnimationCon: Phaser.GameObjects.Sprite;
    protected mSubScriptSprite: Phaser.GameObjects.Sprite;
    protected mSubScriptRes: string;
    protected itemBG: Phaser.GameObjects.Sprite;
    protected mSelectSprite: Phaser.GameObjects.Image;
    protected mSelectRes: string;
    protected mWorld: WorldService;

    protected minitialize: boolean = false;
    protected mWid: number = 0;
    protected mHei: number = 0;
    constructor(scene: Phaser.Scene, world: WorldService, parentCon: Phaser.GameObjects.Container, x: number, y: number, resStr: string, respng: string, resjson: string, resSlot: string, selectRes?: string, subscriptRes?: string) {
        this.mScene = scene;
        this.mWorld = world;
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
    }

    public createUI() {
        this.onLoadCompleteHandler();
    }

    public getView(): any {
        return this.con;
    }

    public dataChange(val: any) {
        if (!this.minitialize) return;
        this.mData = val;
        if (this.mIcon) {
            let url: string;
            if (this.mData && this.mData.display) {
                url = this.mData.display.texturePath;
                const des = this.mData.des ? "\n" + this.mData.des : "";
                //  this.setToolTipText(this.data.name + des);
            } else {
                // url = "";
            }
            if (!url) return;
            this.mIcon.load(url, this, () => {
                if (this.mData) {
                    // this.mIcon.visible = true;
                }
            });
        }
    }

    public destory() {
        if (this.mSubScriptSprite) {
            this.mSubScriptSprite.destroy(true);
        }
        if (this.mSelectSprite) {
            this.mSelectSprite.destroy(true);
        }
        if (this.mIcon) {
            this.mIcon.destroy();
        }
        this.mWid = 0;
        this.mHei = 0;
        this.mData = null;
    }

    protected onLoadCompleteHandler() {
        this.itemBG = this.mScene.make.sprite(undefined, false);
        this.itemBG.setTexture(this.mResStr, this.mResSlot);
        this.con.addAt(this.itemBG, 0);
        this.con.setSize(this.itemBG.width, this.itemBG.height);
        this.mIcon = new DragDropIcon(this.mScene, 0, 0);
        this.con.addAt(this.mIcon, 1);
        if (this.mSubScriptRes) {
            this.mSubScriptSprite = this.mScene.make.sprite(undefined, false);
            this.mSubScriptSprite.setTexture(this.mResStr, this.mSubScriptRes);
            this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.itemBG.width >> 1;
            this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.itemBG.height >> 1;
            // this.con.addAt(this.mSubScriptSprite, 2);
        }
        this.con.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.itemBG.width, 56), Phaser.Geom.Rectangle.Contains);
        this.con.on("pointerover", this.overHandler, this);
        this.con.on("pointerout", this.outHandler, this);
        this.con.on("pointerdown", this.downHandler, this);
        this.minitialize = true;
        if (this.mData) {
            this.dataChange(this.mData);
        }
        this.mWid += this.itemBG.width;
        this.mHei += this.itemBG.height;
    }

    protected downHandler(pointer) {
        if (!this.mData) return;
        const pack: op_gameconfig.IPackage = (this.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel).mainPlayerInfo.package;
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = pack.id;
        content.componentId = this.mData.id;
        this.mWorld.connection.send(pkt);
    }

    protected overHandler(pointr) {
        if (this.mSelectRes && this.mSelectRes.length > 0) {
            this.mSelectSprite = this.mScene.make.image(undefined, false);
            this.mSelectSprite.setTexture(this.mResStr, this.mSelectRes);
            this.con.add(this.mSelectSprite);
        }
    }

    protected outHandler(pointr) {
        if (this.mSelectSprite && this.mSelectSprite.parentContainer) {
            this.mSelectSprite.parentContainer.remove(this.mSelectSprite);
            this.mSelectSprite.destroy(true);
        }
    }
}
