import { IBag } from "../basebag";
import { WorldService } from "../../../game/world.service";
import { ItemSlot } from "../item.slot";
import { Size } from "../../../utils/size";
import { BagMediator } from "../bag/bagMediator";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_gameconfig } from "pixelpai_proto";
import { Logger } from "../../../utils/log";
import { BagPanel } from "../bag/bagPanel";
import { PlayerDataModel } from "../../../service/player/playerDataModel";
import { UIMediatorType } from "../../ui.mediatorType";
import { PlayerInfo } from "../../../service/player/playerInfo";
import { BagModel } from "../../../service/bag/bagModel";
import { Url } from "../../../utils/resUtil";

/**
 * 背包显示栏
 */
export class BagUIPC implements IBag {

    public static SlotMaxCount: number = 12;
    // bagBtn
    public bagBtn: Phaser.GameObjects.Sprite;
    public bagSlotList: ItemSlot[];

    private mShowing: boolean = false;
    private mBagBg: Phaser.GameObjects.Sprite;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mParentCon: Phaser.GameObjects.Container;
    private mSubScriptSprite: Phaser.GameObjects.Sprite;
    private mBagSelect: Phaser.GameObjects.Sprite;
    private mBagBtnCon: Phaser.GameObjects.Container;

    private mWid: number = 0;
    private mHei: number = 0;
    constructor(scene: Phaser.Scene, world: WorldService, x: number, y: number) {
        this.mScene = scene;
        this.mWorld = world;
        this.mParentCon = this.mScene.add.container(x, y);
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
        this.mShowing = true;
        this.createPanel();
    }
    public update(param: any) {
        // update bagSlotList
    }
    public hide() {
        this.destroy();
    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.mParentCon.x = (size.width - this.mWid) / 2;
        this.mParentCon.y = size.height - 50;
    }
    public destroy() {
        this.mWid = 0;
        this.mHei = 0;
        if (this.mParentCon) this.mParentCon.destroy(true);
    }

    public setDataList(items: op_gameconfig.IItem[]) {
        const childList: Phaser.GameObjects.GameObject[] = [];
        const len: number = items.length > BagUIPC.SlotMaxCount ? BagUIPC.SlotMaxCount : items.length;
        const subScriptList: string[] = ["0", "b", "c"];
        let subScriptRes: string;
        let tempWid: number = this.mBagBg.width + 5;
        for (let i: number = 0; i < len; i++) {
            if (i >= 9) {
                subScriptRes = "bag_SubScript" + subScriptList[i % 9];
            } else {
                subScriptRes = "bag_SubScript" + (i + 1);
            }
            let itemSlot: ItemSlot = this.bagSlotList[i];
            if (!itemSlot) {
                itemSlot = new ItemSlot(this.mScene, this.mWorld, this.mParentCon, 0, 0, this.mResStr, this.mResPng, this.mResJson, "bag_Slot", "", subScriptRes);
                itemSlot.createUI();
                this.bagSlotList.push(itemSlot);
                childList.push(itemSlot.con);
            }
            itemSlot.dataChange(items[i]);
            tempWid += 56 + 5;
        }
        if (this.mWid !== tempWid) {
            this.mWid = tempWid;
            const buttons = (<any> this.mScene).rexUI.add.buttons({
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
            buttons.layout();
            buttons.on("button.click", function(button, groupName, index, pointer) {
                if (index === 0) {
                }
            }, this);
            this.mParentCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mWid, this.mHei), Phaser.Geom.Rectangle.Contains);
            this.resize();
        }
    }

    private createPanel() {
        this.mResStr = "bag";
        this.mResPng = "ui/bag/bag.png";
        this.mResJson = "ui/bag/bag.json";
        if (!this.mScene.cache.obj.has(this.mResStr)) {
            this.mScene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    private onLoadCompleteHandler() {
        this.mWid = 0;
        this.mHei = 65;

        this.mBagBtnCon = this.mScene.add.container(0, 0);
        this.mBagBg = this.mScene.add.sprite(0, 0, this.mResStr, "bag_BtnBg");
        this.mWid += this.mBagBg.width + 5;
        this.bagBtn = this.mScene.add.sprite(this.mBagBg.x, this.mBagBg.y, this.mResStr, "bag_Btn");
        this.mSubScriptSprite = this.mScene.make.sprite(undefined, false);
        this.mSubScriptSprite.setTexture(this.mResStr, "bag_SubScripta");
        this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.mBagBg.width >> 1;
        this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.mBagBg.height >> 1;
        this.mBagBtnCon.addAt(this.mBagBg, 0);
        this.mBagBtnCon.addAt(this.bagBtn, 1);
        this.mBagBtnCon.addAt(this.mSubScriptSprite, 2);
        this.mBagBtnCon.setSize(56, 56);
        this.mBagBtnCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBagBg.width, this.mBagBg.height), Phaser.Geom.Rectangle.Contains);
        this.mParentCon.add(this.mBagBtnCon);
        this.bagBtn.setInteractive();
        this.bagBtn.on("pointerdown", this.bagHandler, this);
        this.bagBtn.on("pointerover", this.bagBtnOver, this);
        this.bagBtn.on("pointerout", this.bagBtnOut, this);

        const playerInfo: PlayerInfo = (this.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel).mainPlayerInfo;
        if (playerInfo.package && playerInfo.package.items) this.setDataList(playerInfo.package.items);
        // childList.push(this.mBagBtnCon);
    }

    private bagHandler() {
        this.mWorld.uiManager.getMediator(UIMediatorType.BagMediator).show();
        // =============index = 0 为背包按钮
        const bagModel: BagModel = this.mWorld.modelManager.getModel(BagModel.NAME) as BagModel;
        const playerModel: PlayerDataModel = this.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel;
        bagModel.requestVirtualWorldQueryPackage(playerModel.mainPlayerInfo.package.id, 1, BagPanel.PageMaxCount);
        // Logger.debug(button);
    }

    private bagBtnOver(pointer) {
        this.mBagSelect = this.mScene.make.sprite(undefined, false);
        this.mBagSelect.setTexture(this.mResStr, "bag_BtnSelect");
        this.mBagBtnCon.add(this.mBagSelect);
    }

    private bagBtnOut(pointer) {
        if (this.mBagSelect && this.mBagSelect.parentContainer) {
            this.mBagSelect.parentContainer.remove(this.mBagSelect);
        }
    }
}
