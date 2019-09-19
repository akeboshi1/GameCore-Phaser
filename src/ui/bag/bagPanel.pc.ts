import { IAbstractPanel } from "../abstractPanel";
import { IBag } from "./basebag";
import { WorldService } from "../../game/world.service";
import { Logger } from "../../utils/log";
import { ItemSlot } from "./item.slot";
import { Size } from "../../utils/size";

/**
 * 背包显示栏
 */
export class BagPanelPC implements IAbstractPanel, IBag {
    // bagBtn
    public bagBtn: Phaser.GameObjects.Sprite;
    public bagSlotList: ItemSlot[];

    private mBagBg: Phaser.GameObjects.Sprite;

    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private parentCon: Phaser.GameObjects.Container;
    private mSubScriptSprite: Phaser.GameObjects.Sprite;
    private baseX: number;
    private baseY: number;
    constructor(scene: Phaser.Scene, world: WorldService, x: number, y: number) {
        this.mScene = scene;
        this.mWorld = world;
        this.baseX = x;
        this.baseY = y;
        this.parentCon = this.mScene.add.container(x, y);
        this.bagSlotList = [];
        this.createPanel();
    }

    public createPanel() {
        this.mResStr = "bag";
        this.mResPng = "resources/ui/bag/bag.png";
        this.mResJson = "resources/ui/bag/bag.json";
        if (!this.mScene.cache.obj.has(this.mResStr)) {
            this.mScene.load.atlas(this.mResStr, this.mResPng, this.mResJson);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    public show() {

    }
    public close() {

    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.parentCon.x = size.width - 600 >> 1;
        this.parentCon.y = size.height - 50;
    }
    public destroy() {
        this.mBagBg.destroy();

    }

    private onLoadCompleteHandler() {
        let wid: number = 0;
        const hei: number = 65;
        const childList: Phaser.GameObjects.GameObject[] = [];
        const bagBtnCon: Phaser.GameObjects.Container = this.mScene.add.container(0, 0);
        this.mBagBg = this.mScene.add.sprite(0, 0, this.mResStr, "bag_BtnBg");
        wid += this.mBagBg.width + 5;
        this.bagBtn = this.mScene.add.sprite(this.mBagBg.x, this.mBagBg.y, this.mResStr, "bag_Btn");
        this.mSubScriptSprite = this.mScene.make.sprite(undefined, false);
        this.mSubScriptSprite.setTexture(this.mResStr, "bag_SubScripta");
        this.mSubScriptSprite.x = this.mSubScriptSprite.width - this.mBagBg.width >> 1;
        this.mSubScriptSprite.y = this.mSubScriptSprite.height - this.mBagBg.height >> 1;
        bagBtnCon.addAt(this.mBagBg, 0);
        bagBtnCon.addAt(this.bagBtn, 1);
        bagBtnCon.addAt(this.mSubScriptSprite, 2);
        bagBtnCon.setSize(this.mBagBg.width, this.mBagBg.height);
        bagBtnCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBagBg.width, this.mBagBg.height), Phaser.Geom.Rectangle.Contains);
        this.parentCon.add(bagBtnCon);
        childList.push(bagBtnCon);
        let itemSlot: ItemSlot;
        const subScriptList: string[] = ["0", "b", "c"];
        let subScriptRes: string;
        for (let i: number = 0; i < 12; i++) {
            if (i >= 9) {
                subScriptRes = "bag_SubScript" + subScriptList[i % 9];
            } else {
                subScriptRes = "bag_SubScript" + (i + 1);
            }
            itemSlot = new ItemSlot(this.mScene, this.parentCon, wid, 0, this.mResStr, this.mResPng, this.mResJson, subScriptRes);
            itemSlot.id = i;
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

        buttons.on("button.click", function(button, groupName, index, pointer) {
            Logger.debug(button);
        }, this);

        this.parentCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
        // this.parentCon.setInteractive();
        // this.parentCon.on("pointerdown", this.uiDown, this);
        // this.parentCon.on("pointerup", this.uiUp, this);
    }

    // private uiDown(pointer, gameObject) {
    //     this.bagBtn.scaleX = this.bagBtn.scaleY = .8;
    //     Logger.log("btnClick" + gameObject);
    // }

    // private uiUp(pointer, gameObject) {
    //     this.bagBtn.scaleX = this.bagBtn.scaleY = 1;
    // }
}
