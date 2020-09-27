import { BasePanel } from "../../components/BasePanel";
import { WorldService } from "../../../game/world.service";
import { IconBtn } from "../icon.btn";
import { Size } from "../../../game/core/utils/size";
import { ItemSlot } from "../../bag/item.slot";
import { Url } from "../../../game/core/utils/resUtil";
import { op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { BagMediator } from "../../bag/bagView/bagMediator";
import { BottomMediator } from "../bottomGroup/bottom.mediator";
export class RightBtnGroup extends BasePanel {
    public static SlotMaxCount: number = 4;
    private mBtnY: number = 0;
    private mWid: number = 0;
    private mHei: number = 0;
    private handBtn: IconBtn;
    // private handBg: Phaser.GameObjects.Image;
    private mBagSlotList: ItemSlot[];
    private mResKey: string;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.disInteractive();
    }

    public show(param?: any) {
        super.show(param);
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.refreshSlot();
        const bottomMed = this.mWorld.uiManager.getMediator(BottomMediator.NAME) as BottomMediator;
        const padHei: number = !bottomMed ? this.height / 2 : bottomMed.getView().height;
        this.scale = this.mWorld.uiScale;
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            const mPackage: op_gameconfig.IPackage = this.mWorld.roomManager.currentRoom.playerManager.actor.package;
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
            const mPackage: op_gameconfig.IPackage = this.mWorld.roomManager.currentRoom.playerManager.actor.package;
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
        this.scene.tweens.add({
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
        if (!this.handBtn) return;
        this.mHei = this.handBtn.height;
        if (this.mBagSlotList) {
            this.mBagSlotList.forEach((itemslot: ItemSlot) => {
                if (itemslot) {
                    itemslot.getView().visible = false;
                }
            });
            // =============获取角色背包前几位物品
            const mPackage: op_gameconfig.IPackage = this.mWorld.roomManager.currentRoom.playerManager.actor.package;
            if (mPackage && mPackage.items) {
                const items: op_gameconfig.IItem[] = mPackage.items;
                const len: number = items.length > RightBtnGroup.SlotMaxCount ? RightBtnGroup.SlotMaxCount : items.length;
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
        this.scene.load.atlas(this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        this.mWorld.uiManager.getUILayerManager().addToUILayer(this);
        this.mBtnY = 0;
        this.handBtn = new IconBtn(this.scene, this.mWorld, {
            key: BagMediator.NAME, bgResKey: this.mResKey, bgTextures: ["btnGroup_bg.png"],
            iconResKey: this.mResKey, iconTexture: "btnGroup_hand.png", scale: 1, pngUrl: "ui/baseView/mainui_mobile.png", jsonUrl: "ui/baseView/mainui_mobile.json"
        });
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
        const len: number = RightBtnGroup.SlotMaxCount;
        const posX: number = 0;
        const posY: number = 0;
        for (let i: number = 0; i < len; i++) {
            const itemSlot: ItemSlot = new ItemSlot(this.scene, this.mWorld, this, posX, posY, this.mResKey, Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"), "btnGroup_bg.png");
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
