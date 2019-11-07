import { Panel } from "../../components/panel";
import { WorldService } from "../../../game/world.service";
import { IconBtn } from "./icon.btn";
import { Size } from "../../../utils/size";
import { ItemSlot } from "../../bag/item.slot";
import { Url } from "../../../utils/resUtil";
import { ISprite } from "../../../rooms/element/sprite";
import { op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { MainUIMobile } from "./mainUI.mobile";
import { PBpacket } from "net-socket-packet";

export class RightBtnGroup extends Panel {
    private mWorld: WorldService;
    private mBtnY: number = 0;
    private mWid: number = 0;
    private mHei: number = 0;
    private handBtn: IconBtn;
    // private handBg: Phaser.GameObjects.Image;
    private mBagSlotList: ItemSlot[];
    private mResKey: string;
    private mOrientation: number;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public show(param?: any) {
        super.show(param);
        this.scaleX = this.scaleY = this.mWorld.uiScale;
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        switch (this.mWorld.game.scale.orientation) {
            case Phaser.Scale.Orientation.LANDSCAPE:
                this.y = size.height - this.height / 2 - 100 * this.mWorld.uiScale;
                this.x = size.width - 70 * this.mWorld.uiScale;
                break;
            case Phaser.Scale.Orientation.PORTRAIT:
                this.y = size.height / 2 + 100 * this.mWorld.uiScale;
                this.x = size.width - this.width / 2 - 50 * this.mWorld.uiScale;
                break;
        }
        this.refreshSlot();
        this.scaleX = this.scaleY = this.mWorld.uiScale;
    }

    public hide() {
        super.hide();
        this.destroy();
    }

    public destroy() {
        this.mBtnY = 0;
        this.mWid = 0;
        this.mHei = 0;
        if (this.mBagSlotList) {
            this.mBagSlotList.forEach((itemslot) => {
                if (itemslot) {
                    itemslot.destroy();
                    itemslot = null;
                }
            });
        }
        this.mResKey = "";
        this.mBagSlotList = null;
        super.destroy();
    }

    protected preload() {
        this.mResKey = "baseView";
        this.mScene.load.atlas(this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        this.mBtnY = 0;
        this.handBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, ["btnGroup_bg.png"], "btnGroup_hand.png", 1);
        this.handBtn.x = 0;
        this.handBtn.y = this.mBtnY + this.handBtn.height / 2;
        this.handBtn.setClick(() => {
            // f键值为70，点击该按钮交互
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
            const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
            content.keyCodes = [70];
            this.mWorld.connection.send(pkt);
        });
        this.add(this.handBtn);
        this.mBagSlotList = [];
        this.initBagSlotData();
        super.init();
    }

    private refreshSlot() {
        if (this.mBagSlotList && this.mBagSlotList.length > 1) {
            const len: number = this.mBagSlotList.length;
            let posX: number = 0;
            let posY: number = 0;
            const radio: number = 110;
            const slotSize: number = 56;
            const baseAngle: number = 38;
            for (let i: number = 0; i < len; i++) {
                if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                    const angle: number = (baseAngle * (i + 2) / -180) * Math.PI;
                    posX = radio * Math.cos(angle);
                    posY = this.handBtn.y + radio * Math.sin(angle);
                    if (i === len - 1) {
                        this.mWid = radio + this.handBtn.width + 30 + slotSize / 2;
                        this.mHei = radio + this.handBtn.height + 30 + slotSize / 2;
                    }
                } else {
                    posX = 0;
                    posY = -slotSize * (i + 1) - 20 * i;
                    if (i === len - 1) {
                        this.mWid = this.handBtn.width;
                        this.mHei = slotSize * (len - 1) + 5 * (len - 2) + this.handBtn.height + 5;
                    }
                }
                const itemSlot: ItemSlot = this.mBagSlotList[i];
                itemSlot.toolTipCon.x = posX;
                itemSlot.toolTipCon.y = posY;
            }
        }
    }

    private initBagSlotData() {
        // =============获取角色背包前几位物品
        const playerModel: ISprite = this.mWorld.roomManager.currentRoom.getHero().model;
        if (playerModel.package && playerModel.package.items) {
            const items: op_gameconfig.IItem[] = playerModel.package.items;
            const len: number = items.length > MainUIMobile.SlotMaxCount ? MainUIMobile.SlotMaxCount : items.length;
            const posX: number = 0;
            const posY: number = 0;
            for (let i: number = 0; i < len; i++) {
                const itemSlot: ItemSlot = new ItemSlot(this.mScene, this.mWorld, this, posX, posY, this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"), "btnGroup_bg.png");
                itemSlot.createUI();
                itemSlot.dataChange(items[i]);
                itemSlot.getBg().scaleX = itemSlot.getBg().scaleY = 0.8;
                itemSlot.getIcon().scaleX = itemSlot.getIcon().scaleY = 1.2;
                this.mBagSlotList.push(itemSlot);
                this.add(itemSlot.toolTipCon);
            }
        }
        this.setSize(this.mWid, this.mHei);
        this.resize();
    }
}
