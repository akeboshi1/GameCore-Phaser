import { ItemSlot } from "../../Bag/Item.slot";
import { Radio } from "../../Components/Radio";
import { ChatMediator } from "../../Chat/Chat.mediator";
import { BagMediator } from "../../Bag/BagView/BagMediator";
import { BasePanel } from "../../Components/BasePanel";
import { WorldService } from "../../../world.service";
import { Size } from "../../../../../utils/size";
import { op_gameconfig } from "pixelpai_proto";
import { Url } from "../../../../../utils/resUtil";

/**
 * 主界面ui pc版本
 */
export class BagGroup extends BasePanel {

    public static SlotMaxCount: number = 12;
    // bagBtn
    public bagBtn: Phaser.GameObjects.Sprite;
    public bagSlotList: ItemSlot[];
    private mBagBg: Phaser.GameObjects.Sprite;
    private baseBagBgWid: number;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mSubScriptSprite: Phaser.GameObjects.Sprite;
    private mBagSelect: Phaser.GameObjects.Sprite;
    private mBagBtnCon: Phaser.GameObjects.Container;
    private radio: Radio;

    private buttons;
    private tmpWid: number = 0;
    constructor(scene: Phaser.Scene, world: WorldService, x: number, y: number) {
        super(scene, world);
        this.x = x;
        this.y = y;
        world.uiManager.getUILayerManager().addToToolTipsLayer(this);
        this.bagSlotList = [];
    }

    public show(param?: any) {
        super.show();
    }

    public resize(wid: number, hei: number) {
        const size: Size = this.mWorld.getSize();
        const chatMed: ChatMediator = this.mWorld.uiManager.getMediator(ChatMediator.NAME) as ChatMediator;
        this.x = (size.width - this.tmpWid) / 2 < chatMed.getView().width ? chatMed.getView().width + this.width / 2 : (size.width - this.tmpWid) / 2;
        this.y = size.height - 50;
    }
    public tweenExpand(show: boolean) {
        if (!this.scene) return;
        const size: Size = this.mWorld.getSize();
        const baseY: number = size.height - 50;
        const toY: number = show === true ? baseY : baseY + 100;
        const toAlpha: number = show === true ? 1 : 0;
        this.scene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Cubic.Out",
            props: {
                y: { value: toY },
                alpha: { value: toAlpha },
            },
        });
    }
    public destroy() {
        if (this.bagSlotList) {
            this.bagSlotList.forEach((slot: ItemSlot) => {
                if (slot) slot.destroy();
            });
            this.bagSlotList.length = 0;
            this.bagSlotList = null;
        }
        this.tmpWid = 0;
        this.baseBagBgWid = 0;
        this.mResStr = null;
        this.mResPng = null;
        this.mResJson = null;
        super.destroy();
    }

    public addListen() {
        if (this.mBagBtnCon) {
            this.mBagBtnCon.on("pointerdown", this.bagHandler, this);
            this.mBagBtnCon.on("pointerover", this.bagBtnOver, this);
            this.mBagBtnCon.on("pointerout", this.bagBtnOut, this);
        }
    }

    public removeListen() {
        if (this.mBagBtnCon) {
            this.mBagBtnCon.off("pointerdown", this.bagHandler, this);
            this.mBagBtnCon.off("pointerover", this.bagBtnOver, this);
            this.mBagBtnCon.off("pointerout", this.bagBtnOut, this);
        }
    }

    public setDataList(items: op_gameconfig.IItem[]) {
        if (this.bagSlotList) {
            this.bagSlotList.forEach((itemslot: ItemSlot) => {
                if (itemslot) itemslot.getView().visible = false;
            });
        }
        const childList: Phaser.GameObjects.GameObject[] = [];
        const len: number = items.length > BagGroup.SlotMaxCount ? BagGroup.SlotMaxCount : items.length;
        let tempWid: number = this.baseBagBgWid + 5;
        for (let i: number = 0; i < len; i++) {
            const itemSlot: ItemSlot = this.bagSlotList[i];
            itemSlot.getView().visible = true;
            childList.push(itemSlot.toolTipCon);
            itemSlot.dataChange(items[i]);
            tempWid += 56 + 5;
        }
        if (this.width !== tempWid) {
            this.width = tempWid;
            if (this.buttons) {
                this.buttons.destroy(true);
                this.buttons = null;
            }
            this.buttons = (<any>this.scene).rexUI.add.buttons({
                x: (tempWid + this.mBagBg.width) / 2,
                y: 0,
                width: 56,
                height: 56,
                orientation: 0,
                buttons: childList,
                groupName: "bagBtn",
                align: "right",
                click: {
                    mode: "pointerup",
                    clickInterval: 100
                },
                space: 5,
                name: "bag",
            });
            this.buttons.layout();
            // this.buttons.on("button.click", function (button, groupName, index, pointer) {
            //     if (index === 0) {
            //     }
            // }, this);
            this.setSize(tempWid, 65);
            this.mWorld.uiManager.baseFaceResize();
        }
    }

    protected preload() {
        if (!this.scene) {
            return;
        }
        this.mResStr = "bag";
        this.mResPng = "ui/bag/bag.png";
        this.mResJson = "ui/bag/bag.json";
        this.scene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
        super.preload();
    }

    protected init() {
        this.mBagBtnCon = this.scene.add.container(0, 0);
        this.mBagBg = this.scene.add.sprite(0, 0, this.mResStr, "bag_BtnBg");
        this.baseBagBgWid = this.mBagBg.width;
        this.tmpWid += this.mBagBg.width + 5;
        this.bagBtn = this.scene.add.sprite(this.mBagBg.x, this.mBagBg.y, this.mResStr, "bag_Btn");
        this.mSubScriptSprite = this.scene.make.sprite(undefined, false);
        this.mSubScriptSprite.setTexture(this.mResStr, "bag_SubScripta");
        this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.mBagBg.width >> 1;
        this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.mBagBg.height >> 1;
        this.mBagBtnCon.addAt(this.mBagBg, 0);
        this.mBagBtnCon.addAt(this.bagBtn, 1);
        // this.mBagBtnCon.addAt(this.mSubScriptSprite, 2);
        this.mBagBtnCon.setSize(56, 56);
        this.mBagBtnCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBagBg.width, this.mBagBg.height), Phaser.Geom.Rectangle.Contains);
        this.initBagSlot();
        this.setSize(this.tmpWid, 65);
        if (this.mWorld.roomManager.currentRoom && this.mWorld.roomManager.currentRoom.playerManager && this.mWorld.roomManager.currentRoom.playerManager.actor) {
            const mPackage: op_gameconfig.IPackage = this.mWorld.roomManager.currentRoom.playerManager.actor.package;
            if (mPackage && mPackage.items) this.setDataList(mPackage.items);
        }
        this.add(this.mBagBtnCon);
        super.init();
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) this.mWorld.uiManager.baseFaceResize();
    }

    private initBagSlot() {
        const subScriptList: string[] = ["0", "b", "c"];
        let subScriptRes: string;
        for (let i: number = 0; i < BagGroup.SlotMaxCount; i++) {
            if (i >= 9) {
                subScriptRes = "bag_SubScript" + subScriptList[i % 9];
            } else {
                subScriptRes = "bag_SubScript" + (i + 1);
            }
            const itemSlot = new ItemSlot(this.scene, this.mWorld, this, 0, 0, this.mResStr, this.mResPng, this.mResJson, "bag_Slot", "", subScriptRes);
            itemSlot.createUI();
            itemSlot.getView().visible = false;
            this.bagSlotList.push(itemSlot);
        }
    }

    private bagHandler() {
        // this.mWorld.uiManager.getMediator(FriendMediator.NAME).show();
        const med = this.mWorld.uiManager.getMediator(BagMediator.NAME);
        if (med.isShow()) {
            med.hide();
            return;
        }
        med.show();
    }

    private tmpLoad() {
        if (!this.radio) {
            this.radio = new Radio(this.scene, {
                wid: 328,
                hei: 142,
                resKey: "juqingRadio",
                resPng: "./resources/ui/juqing/juqing.png",
                resJson: "./resources/ui/juqing/juqing.json",
                resBg: "radio_bg.png",
                resArrow: "radio_arrow.png",
                fontStyle: { size: 20, color: "#ffcc00", bold: false },
                completeBack: () => {
                    this.radioComplete();
                },
                clickCallBack: () => {
                    if (this.radio && this.radio.parentContainer) {
                        this.radio.clearRadioData();
                        this.radio.parentContainer.remove(this.radio);
                    }
                }
            });
            return;
        }
        if (this.radio.isShow) {
            return;
        }
        this.radioComplete();
    }

    private radioComplete() {
        this.radio.setRadioData(["1111111111", "2222222222", "333333333333", "444444444444"]);
        this.radio.x = this.bagBtn.x;
        this.radio.y = this.bagBtn.y - 142;
        this.add(this.radio);
    }

    private bagBtnOver(pointer) {
        this.mBagSelect = this.scene.make.sprite(undefined, false);
        this.mBagSelect.setTexture(this.mResStr, "bag_BtnSelect");
        this.mBagBtnCon.add(this.mBagSelect);
        // this.tmpLoad();
    }

    private bagBtnOut(pointer) {
        if (this.mBagSelect && this.mBagSelect.parentContainer) {
            this.mBagSelect.parentContainer.remove(this.mBagSelect);
        }
    }
}
