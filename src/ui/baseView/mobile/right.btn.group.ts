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
import { MainUIMediator } from "../mainUI.mediator";
import { PlayerModel } from "../../../rooms/player/player.model";
export class RightBtnGroup extends Panel {
    private mBtnY: number = 0;
    private mWid: number = 0;
    private mHei: number = 0;
    private handBtn: IconBtn;
    // private handBg: Phaser.GameObjects.Image;
    private mBagSlotList: ItemSlot[];
    private mResKey: string;
    private mOrientation: number;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mWorld = world;
    }

    public show(param?: any) {
        super.show(param);
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.refreshSlot();
        const mainUIMed = this.mWorld.uiManager.getMediator(MainUIMediator.NAME) as MainUIMediator;
        const padHei: number = !mainUIMed ? this.height / 2 : (mainUIMed.getView() as MainUIMobile).getBottomView().height;
        this.scaleX = this.scaleY = this.mWorld.uiScale;
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            const mPackage: op_gameconfig.IPackage = this.mWorld.roomManager.currentRoom.getHero().package;
            this.y = size.height - (this.height) * this.mWorld.uiScale;
            this.x = size.width - (this.width / 2) * this.mWorld.uiScale;
            if (mPackage && mPackage.items && mPackage.items.length > 0) {
                this.y = size.height - (this.height / 2) * this.mWorld.uiScale;
                this.x = size.width - (this.width / 4) * this.mWorld.uiScale;
            } else {
                this.y = size.height - (this.height) * this.mWorld.uiScale;
                this.x = size.width - (this.width / 2) * this.mWorld.uiScale;
            }
        } else if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.PORTRAIT) {
            this.y = size.height - (padHei + this.height / 2) * this.mWorld.uiScale;
            this.x = size.width - (this.width / 2) * this.mWorld.uiScale;
        }
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

    public tweenView(show: boolean) {
        const size: Size = this.mWorld.getSize();
        let baseX: number;
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            const mPackage: op_gameconfig.IPackage = this.mWorld.roomManager.currentRoom.getHero().package;
            if (mPackage && mPackage.items && mPackage.items.length > 0) {
                baseX = size.width - (this.width / 4) * this.mWorld.uiScale;
            } else {
                baseX = size.width - (this.width / 2) * this.mWorld.uiScale;
            }
        } else {
            baseX = size.width - (this.width / 2) * this.mWorld.uiScale;
        }
        const toX: number = show === true ? baseX : baseX + this.width;
        const toAlpha: number = show === true ? 1 : 0;
        this.mScene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Linear",
            props: {
                x: { value: toX },
                alpha: { value: toAlpha },
            },
        });
    }

    public refreshSlot() {
        this.mHei = this.handBtn.height;
        if (this.mBagSlotList) {
            this.mBagSlotList.forEach((itemslot: ItemSlot) => {
                if (itemslot) {
                    itemslot.getView().visible = false;
                }
            });
            // =============获取角色背包前几位物品
            const mPackage: op_gameconfig.IPackage = this.mWorld.roomManager.currentRoom.getHero().package;
            if (mPackage && mPackage.items) {
                const items: op_gameconfig.IItem[] = mPackage.items;
                const len: number = items.length > MainUIMobile.SlotMaxCount ? MainUIMobile.SlotMaxCount : items.length;
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
                    itemSlot.getView().visible = true;
                    itemSlot.toolTipCon.x = posX;
                    itemSlot.toolTipCon.y = posY;
                    itemSlot.dataChange(items[i]);
                }
            }
        }
        this.setSize(this.mWid, this.mHei);
    }

    protected tweenComplete(show: boolean) {
        this.resize();
        super.tweenComplete(show);
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

            // ========临时调试用
            // const mainUIMed: MainUIMediator = this.mWorld.uiManager.getMediator(MainUIMediator.NAME) as MainUIMediator;
            // mainUIMed.tweenView(false);
            // this.mWorld.uiManager.getMediator(BagMediator.NAME).show();
        });
        this.add(this.handBtn);
        this.mWid = this.handBtn.width;
        this.mHei = this.handBtn.height;
        this.initBagSlotData();
        super.init();
    }

    private initBagSlotData() {
        this.mBagSlotList = [];
        const size: Size = this.mWorld.getSize();
        const len: number = MainUIMobile.SlotMaxCount;
        const posX: number = 0;
        const posY: number = 0;
        for (let i: number = 0; i < len; i++) {
            const itemSlot: ItemSlot = new ItemSlot(this.mScene, this.mWorld, this, posX, posY, this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"), "btnGroup_bg.png");
            itemSlot.createUI();
            itemSlot.getBg().scaleX = itemSlot.getBg().scaleY = 0.8;
            itemSlot.getIcon().scaleX = itemSlot.getIcon().scaleY = 1.2;
            this.mBagSlotList.push(itemSlot);
            this.add(itemSlot.toolTipCon);
            itemSlot.getView().visible = false;
        }
        this.resize();
    }
}
