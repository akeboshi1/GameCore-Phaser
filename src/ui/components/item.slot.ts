import { IListItemComponent } from "./IListItemRender";
import { op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { DragDropIcon } from "./dragDropIcon";
import { WorldService } from "../../game/world.service";
import { PBpacket } from "net-socket-packet";
import { Url } from "../../utils/resUtil";
import { IToolTip } from "../tips/itoolTip";
import { ToolTip } from "../tips/toolTip";

export class ItemSlot implements IListItemComponent {
    // public url: string;
    // public id: number;
    // public count: number;
    public toolTipCon: Phaser.GameObjects.Container;
    public index: number;
    protected toolTip: IToolTip;
    protected mData: op_gameconfig.Item;
    protected mScene: Phaser.Scene;
    protected mResStr: string;
    protected mResPng: string;
    protected mResJson: string;
    protected mResSlot: string;
    protected mIcon: DragDropIcon;
    protected mAnimationCon: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
    protected mSubScriptSprite: Phaser.GameObjects.Image;
    protected mSubScriptRes: string;
    protected itemBG: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
    protected mSelectSprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics;
    protected mSelectRes: string;
    protected mWorld: WorldService;

    protected minitialize: boolean = false;
    protected mWid: number = 0;
    protected mHei: number = 0;
    protected isTipBoo: boolean = true;
    constructor(scene: Phaser.Scene, world: WorldService, parentCon: Phaser.GameObjects.Container, x: number, y: number, resStr?: string, respng?: string, resjson?: string, resSlot?: string, selectRes?: string, subscriptRes?: string) {
        this.mScene = scene;
        this.mWorld = world;
        this.toolTipCon = scene.make.container(undefined, false); // new ToolTipContainer(this.mScene, world);
        this.toolTipCon.x = x;
        this.toolTipCon.y = y;
        parentCon.add(this.toolTipCon);
        this.mResStr = resStr;
        this.mResPng = respng;
        this.mResJson = resjson;
        this.mResSlot = resSlot;
        this.mSubScriptRes = subscriptRes;
        this.mSelectRes = selectRes;
    }

    public set hasTip(value: boolean) {
        this.isTipBoo = value;
    }

    public get hasTip(): boolean {
        return this.isTipBoo;
    }

    public createUI() {
        this.onLoadCompleteHandler();
    }

    public getView(): any {
        return this.toolTipCon;
    }

    public getBg(): Phaser.GameObjects.Graphics | Phaser.GameObjects.Image {
        return this.itemBG;
    }

    public getIcon(): DragDropIcon {
        return this.mIcon;
    }

    public dataChange(val: any) {
        if (!this.minitialize) return;
        this.mData = val;
        if (this.mIcon) {
            let url: string;
            if (this.mData && this.mData.display) {
                url = this.mData.display.texturePath;
                const des = this.mData.des ? "\n" + this.mData.des : "";
                this.setToolTipData(this.mData.name + this.mData.des);
            } else {
                this.mIcon.icon.visible = false;
            }
            if (!url) return;
            if (this.mScene.textures.exists(Url.getOsdRes(url))) {
                if (this.mData) {
                    this.mIcon.icon.setTexture(Url.getOsdRes(url));
                    this.mIcon.icon.visible = true;
                }
            } else {
                this.mIcon.load(url, this, () => {
                    if (this.mData) {
                        this.mIcon.icon.visible = true;
                    }
                });
            }
        } else {
            this.mIcon.icon.visible = false;
        }
    }

    public destroy() {
        if (this.mSubScriptSprite) {
            this.mSubScriptSprite.destroy(true);
            this.mSubScriptSprite = null;
        }
        if (this.mSelectSprite) {
            this.mSelectSprite.destroy(true);
            this.mSelectSprite = null;
        }
        if (this.mIcon) {
            this.mIcon.destroy();
        }
        if (this.toolTipCon) {
            this.toolTipCon.destroy();
            this.toolTipCon = null;
        }
        if (this.toolTip) {
            this.toolTip.destroy();
            this.toolTip = null;
        }
        if (this.mAnimationCon) {
            this.mAnimationCon.destroy(true);
            this.mAnimationCon = null;
        }
        if (this.itemBG) {
            this.itemBG.destroy(true);
            this.itemBG = null;
        }

        this.index = 0;
        this.mData = null;
        this.mScene = null;
        this.mWorld = null;
        this.mResStr = null;
        this.mResPng = null;
        this.mResSlot = null;
        this.mResJson = null;
        this.mSubScriptRes = null;
        this.mSelectRes = null;
        this.mWorld = null;
        this.minitialize = false;
        this.mWid = 0;
        this.mHei = 0;
        this.mData = null;
        this.isTipBoo = true;
    }

    protected setToolTipData(text: string) {
        if (this.toolTip) {
            this.toolTip.setToolTipData(text);
        }
    }

    protected onLoadCompleteHandler() {
        let bgWid: number = 56;
        let bgHei: number = 56;
        if (this.mResStr) {
            this.itemBG = this.mScene.make.image(undefined, false);
            this.itemBG.setTexture(this.mResStr, this.mResSlot);
            bgWid = this.itemBG.width;
            bgHei = this.itemBG.height;
        } else {
            this.itemBG = this.mScene.make.graphics(undefined, false);
            this.itemBG.fillStyle(0, .8);
            this.itemBG.fillRect(-bgWid >> 1, -bgHei >> 1, bgWid, bgHei);
        }

        this.toolTipCon.addAt(this.itemBG, 0);
        this.toolTipCon.setSize(bgWid, bgHei);
        this.mIcon = new DragDropIcon(this.mScene, 0, 0);
        this.toolTipCon.addAt(this.mIcon, 1);
        if (this.mSubScriptRes) {
            this.mSubScriptSprite = this.mScene.make.image(undefined, false);
            this.mSubScriptSprite.setTexture(this.mResStr, this.mSubScriptRes);
            this.mSubScriptSprite.x = this.mSubScriptSprite.width - bgWid >> 1;
            this.mSubScriptSprite.y = this.mSubScriptSprite.height - bgHei >> 1;
            // this.con.addAt(this.mSubScriptSprite, 2);
        }
        if (this.isTipBoo) {
            this.toolTip = new ToolTip(this.mScene, "itemSlotTip", Url.getRes("ui/toolTip/toolTip.json"), Url.getRes("ui/toolTip/toolTip.png"), this.mWorld.uiScale);
        }

        this.toolTipCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, bgWid, bgHei), Phaser.Geom.Rectangle.Contains);
        this.toolTipCon.on("pointerover", this.overHandler, this);
        this.toolTipCon.on("pointerout", this.outHandler, this);
        this.toolTipCon.on("pointerdown", this.downHandler, this);
        this.toolTipCon.on("pointerup", this.outHandler, this);
        this.minitialize = true;
        if (this.mData) {
            this.dataChange(this.mData);
        }
        this.mWid += bgWid;
        this.mHei += bgHei;
        // this.toolTipCon.setToolTip("itemSlotTip", Url.getRes("ui/toolTip/toolTip.json"), Url.getRes("ui/toolTip/toolTip.png"));
    }

    protected downHandler(pointer) {
        if (!this.mData || !this.mWorld.roomManager.currentRoom.playerManager.actor || !this.mWorld.roomManager.currentRoom || !this.mWorld.roomManager.currentRoom.playerManager) return;
        // if (this.mWorld.game.device.os.desktop) {
        const pack: op_gameconfig.IPackage = this.mWorld.roomManager.currentRoom.playerManager.actor.package;
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_TARGET_UI = pkt.content;
        content.uiId = pack.id;
        content.componentId = this.mData.id;
        this.mWorld.connection.send(pkt);
        // } else {
        //     // this.overHandler(pointer);
        // }
    }

    protected overHandler(pointer) {
        if (this.toolTip && this.mData) {
            this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this.toolTip);
            (this.toolTip as ToolTip).setToolTipData(this.mData.name + this.mData.des);
            this.toolTip.x = pointer.x;
            this.toolTip.y = pointer.y;
        }
        if (this.mSelectRes && this.mSelectRes.length > 0) {
            this.mSelectSprite = this.mScene.make.sprite(undefined, false);
            this.mSelectSprite.play(this.mSelectRes);
            this.toolTipCon.add(this.mSelectSprite);
        } else {
            this.mSelectSprite = this.mScene.make.graphics(undefined, false);
            this.mSelectSprite.fillStyle(0xffff, .8);
            this.mSelectSprite.fillRect(-this.mWid >> 1, -this.mHei >> 1, this.mWid, this.mHei);
            this.toolTipCon.add(this.mSelectSprite);
        }
    }

    protected outHandler(pointer) {
        if (this.toolTip) {
            if (this.toolTip.parentContainer) {
                this.toolTip.parentContainer.remove(this.toolTip);
            }
        }
        if (this.mSelectSprite && this.mSelectSprite.parentContainer) {
            this.mSelectSprite.parentContainer.remove(this.mSelectSprite);
            this.mSelectSprite.destroy(true);
            this.mSelectSprite = null;
        }
    }
}
