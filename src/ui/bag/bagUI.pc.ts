import { IBag } from "./basebag";
import { WorldService } from "../../game/world.service";
import { ItemSlot } from "./item.slot";
import { Size } from "../../utils/size";
import { BagMediator } from "./bagMediator";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { BagPanel } from "./bagPanel";
import { PlayerDataModel } from "../../service/player/playerDataModel";
import { UIMediatorType } from "../ui.mediatorType";

/**
 * 背包显示栏
 */
export class BagUIPC implements IBag {
    // bagBtn
    public bagBtn: Phaser.GameObjects.Sprite;
    public bagSlotList: ItemSlot[];
    public isShow: boolean = false;

    private mBagBg: Phaser.GameObjects.Sprite;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mParentCon: Phaser.GameObjects.Container;
    private mSubScriptSprite: Phaser.GameObjects.Sprite;
    private mItemList: any[];
    private mBagSelect: Phaser.GameObjects.Sprite;
    private mBagBtnCon: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, world: WorldService, x: number, y: number) {
        this.mScene = scene;
        this.mWorld = world;
        this.mParentCon = this.mScene.add.container(x, y);
        this.bagSlotList = [];
    }

    public show(param: any) {
        if (this.isShow) {
            // this.hide();
            return;
        }
        this.isShow = true;
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
        this.mParentCon.x = (size.width >> 1) - 29;
        this.mParentCon.y = size.height - 50;
    }
    public destroy() {
        if (this.mParentCon) this.mParentCon.destroy(true);
    }

    private createPanel() {
        this.mResStr = "bag";
        this.mResPng = "./resources/ui/bag/bag.png";
        this.mResJson = "./resources/ui/bag/bag.json";
        if (!this.mScene.cache.obj.has(this.mResStr)) {
            this.mScene.load.atlas(this.mResStr, this.mResPng, this.mResJson);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    private onLoadCompleteHandler() {
        let wid: number = 0;
        const hei: number = 65;
        const childList: Phaser.GameObjects.GameObject[] = [];
        this.mBagBtnCon = this.mScene.add.container(0, 0);
        this.mBagBg = this.mScene.add.sprite(0, 0, this.mResStr, "bag_BtnBg");
        wid += this.mBagBg.width + 5;
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
        this.mBagBtnCon.on("pointerover", this.bagBtnOver, this);
        this.mBagBtnCon.on("pointerout", this.bagBtnOut, this);
        this.mParentCon.add(this.mBagBtnCon);
        childList.push(this.mBagBtnCon);
        let itemSlot: ItemSlot;
        const subScriptList: string[] = ["0", "b", "c"];
        let subScriptRes: string;
        for (let i: number = 0; i < 12; i++) {
            if (i >= 9) {
                subScriptRes = "bag_SubScript" + subScriptList[i % 9];
            } else {
                subScriptRes = "bag_SubScript" + (i + 1);
            }
            itemSlot = new ItemSlot(this.mScene, this.mParentCon, 0, 0, this.mResStr, this.mResPng, this.mResJson, "bag_slot", "", subScriptRes);
            this.bagSlotList.push(itemSlot);
            childList.push(itemSlot.con);
            wid += 56 + 5;
        }

        const buttons = (<any> this.mScene).rexUI.add.buttons({
            x: 0,
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
        const s = this;
        buttons.on("button.click", function(button, groupName, index, pointer) {
            if (index === 0) {
                s.mWorld.uiManager.getMediator(UIMediatorType.BagMediator).getView().show();
                // =============index = 0 为背包按钮
                const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
                const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
                const playerModel: PlayerDataModel = s.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel;
                content.id = playerModel.mainPlayerInfo.package[0].id;
                content.page = 1;
                content.perPage = BagPanel.PageMaxCount;
                s.mWorld.connection.send(pkt);
                Logger.debug(button);
            }
        }, this);

        this.mParentCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
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
