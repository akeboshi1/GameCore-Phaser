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
    private mWorld: WorldService;

    private minitialize: boolean = false;
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
        this.createUI();
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
                url = "";
            }
            this.mIcon.load(url, this, () => {
                if (this.mData) {
                    this.mIcon.visible = true;
                }
            });

        }

    }

    public destory() {
        if (this.con) {
            this.con.destroy(true);
        }
        if (this.mSubScriptSprite) {
            this.mSubScriptSprite.destroy(true);
        }
        if (this.mSelectSprite) {
            this.mSelectSprite.destroy(true);
        }
        if (this.mIcon) {
            this.mIcon.destroy();
        }
        this.mData = null;
    }

    private createUI() {
        this.onLoadCompleteHandler();
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

        this.minitialize = true;
        if (this.mData) {
            this.dataChange(this.mData);
            this.con.on("pointerdown", this.downHandler, this);
        }
    }

    private downHandler(pointer) {
        const pack: op_gameconfig.IPackage = (this.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel).mainPlayerInfo.package[0];
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = pack.id;
        content.componentId = this.mData.id;
        this.mWorld.connection.send(pkt);
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
