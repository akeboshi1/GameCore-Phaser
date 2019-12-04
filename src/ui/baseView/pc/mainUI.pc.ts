
import { WorldService } from "../../../game/world.service";
import { ItemSlot } from "../../bag/item.slot";
import { Size } from "../../../utils/size";
import { op_gameconfig, op_virtual_world } from "pixelpai_proto";
import { Url } from "../../../utils/resUtil";
import { ISprite } from "../../../rooms/element/sprite";
import { Panel } from "../../components/panel";
import { Radio } from "../../components/radio";
import { UIMediatorType } from "../../ui.mediatorType";
import { FriendMediator } from "../../friend/friend.mediator";

/**
 * 主界面ui pc版本
 */
export class MainUIPC extends Panel {

    public static SlotMaxCount: number = 12;
    // bagBtn
    public bagBtn: Phaser.GameObjects.Sprite;
    public bagSlotList: ItemSlot[];
    private mBagBg: Phaser.GameObjects.Sprite;
    private baseBagBgWid: number;
    private mWorld: WorldService;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mSubScriptSprite: Phaser.GameObjects.Sprite;
    private mBagSelect: Phaser.GameObjects.Sprite;
    private mBagBtnCon: Phaser.GameObjects.Container;
    private radio: Radio;

    private mWid: number = 0;
    private mHei: number = 0;

    private buttons;

    constructor(scene: Phaser.Scene, world: WorldService, x: number, y: number) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        // this.mParentCon = this.mScene.make.container(undefined, false);
        this.x = x;
        this.y = y;
        world.uiManager.getUILayerManager().addToToolTipsLayer(this);
        this.bagSlotList = [];
    }

    public isShow(): boolean {
        return this.mShowing;
    }

    public show(param: any) {
        if (this.mShowing) {
            // this.hide();
            return;
        }
        super.show(param);
    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = (size.width - this.mWid) / 2;
        this.y = size.height - 50;
    }
    public destroy() {
        if (this.bagBtn) {
            this.bagBtn.destroy(true);
            this.bagBtn = null;
        }
        if (this.mBagBg) {
            this.mBagBg.destroy(true);
            this.mBagBg = null;
        }
        if (this.bagSlotList) {
            this.bagSlotList.forEach((slot: ItemSlot) => {
                if (slot) slot.destroy();
            });
            this.bagSlotList.length = 0;
            this.bagSlotList = null;
        }
        if (this.mSubScriptSprite) {
            this.mSubScriptSprite.destroy(true);
            this.mSubScriptSprite = null;
        }
        if (this.mBagSelect) {
            this.mBagSelect.destroy(true);
            this.mBagSelect = null;
        }
        if (this.mBagBtnCon) {
            this.mBagBtnCon.destroy(true);
            this.mBagBtnCon = null;
        }
        this.mShowing = false;
        this.mWid = 0;
        this.mHei = 0;
        this.baseBagBgWid = 0;
        this.mResStr = null;
        this.mResPng = null;
        this.mResJson = null;
        this.mScene = null;
        this.mWorld = null;
        super.destroy();
    }

    public setDataList(items: op_gameconfig.IItem[]) {
        const childList: Phaser.GameObjects.GameObject[] = [];
        const len: number = items.length > MainUIPC.SlotMaxCount ? MainUIPC.SlotMaxCount : items.length;
        const subScriptList: string[] = ["0", "b", "c"];
        let subScriptRes: string;
        let tempWid: number = this.baseBagBgWid + 5;
        for (let i: number = 0; i < len; i++) {
            if (i >= 9) {
                subScriptRes = "bag_SubScript" + subScriptList[i % 9];
            } else {
                subScriptRes = "bag_SubScript" + (i + 1);
            }
            let itemSlot: ItemSlot = this.bagSlotList[i];
            if (!itemSlot) {
                itemSlot = new ItemSlot(this.mScene, this.mWorld, this, 0, 0, this.mResStr, this.mResPng, this.mResJson, "bag_Slot", "", subScriptRes);
                itemSlot.createUI();
                this.bagSlotList.push(itemSlot);
            }
            childList.push(itemSlot.toolTipCon);
            itemSlot.dataChange(items[i]);
            tempWid += 56 + 5;
        }
        if (this.mWid !== tempWid) {
            this.mWid = tempWid;
            if (this.buttons) {
                this.buttons.destroy(true);
                this.buttons = null;
            }
            this.buttons = (<any> this.mScene).rexUI.add.buttons({
                x: (tempWid + this.mBagBg.width) / 2,
                y: 0,
                width: 56,
                height: 56,
                orientation: 0,
                buttons: childList,
                groupName: "bagBtn",
                align: "center",
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
            this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mWid, this.mHei), Phaser.Geom.Rectangle.Contains);
            this.resize();
        }
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mResStr = "bag";
        this.mResPng = "ui/bag/bag.png";
        this.mResJson = "ui/bag/bag.json";
        this.mScene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
        super.preload();
    }

    protected init() {
        this.mWid = 0;
        this.mHei = 65;

        this.mBagBtnCon = this.mScene.add.container(0, 0);
        this.mBagBg = this.mScene.add.sprite(0, 0, this.mResStr, "bag_BtnBg");
        this.baseBagBgWid = this.mBagBg.width;
        this.mWid += this.mBagBg.width + 5;
        this.bagBtn = this.mScene.add.sprite(this.mBagBg.x, this.mBagBg.y, this.mResStr, "bag_Btn");
        this.mSubScriptSprite = this.mScene.make.sprite(undefined, false);
        this.mSubScriptSprite.setTexture(this.mResStr, "bag_SubScripta");
        this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.mBagBg.width >> 1;
        this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.mBagBg.height >> 1;
        this.mBagBtnCon.addAt(this.mBagBg, 0);
        this.mBagBtnCon.addAt(this.bagBtn, 1);
        // this.mBagBtnCon.addAt(this.mSubScriptSprite, 2);
        this.mBagBtnCon.setSize(56, 56);
        this.mBagBtnCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBagBg.width, this.mBagBg.height), Phaser.Geom.Rectangle.Contains);
        this.add(this.mBagBtnCon);
        this.bagBtn.setInteractive();
        this.bagBtn.on("pointerdown", this.bagHandler, this);
        this.bagBtn.on("pointerover", this.bagBtnOver, this);
        this.bagBtn.on("pointerout", this.bagBtnOut, this);

        const playerModel: ISprite = this.mWorld.roomManager.currentRoom.getHero().model;
        if (playerModel && playerModel.package && playerModel.package.items) this.setDataList(playerModel.package.items);
        // childList.push(this.mBagBtnCon);
        super.init();
    }

    private bagHandler() {
       // this.mWorld.uiManager.getMediator(FriendMediator.NAME).show();
        this.mWorld.uiManager.getMediator(UIMediatorType.BagMediator).show();
        // =============index = 0 为背包按钮
    }

    private tmpLoad() {
        if (!this.radio) {
            this.radio = new Radio(this.mScene, {
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
        this.mBagSelect = this.mScene.make.sprite(undefined, false);
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
