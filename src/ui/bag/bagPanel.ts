import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { ItemSlot } from "./item.slot";
import { Size } from "../../utils/size";
import { Logger } from "../../utils/log";
import ButtonPlugin from "../../../lib/rexui/plugins/button-plugin.js";

export class BagPanel implements IAbstractPanel {
    public bagSlotList: ItemSlot[];
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mPreBtn;
    private mNextBtn;
    private mParentCon: Phaser.GameObjects.Container;
    private mNinePatch;
    constructor(scene: Phaser.Scene, world: WorldService) {
        this.mScene = scene;
        this.mWorld = world;
        const size: Size = world.getSize();
        this.mParentCon = this.mScene.add.container(size.width >> 1, size.height - 200);
        this.bagSlotList = [];
    }
    public show(param: any) {
        this.createPanel();
        // todo refresh bagData
    }
    public update(param: any) {

    }
    public close() {

    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.mParentCon.x = size.width >> 1;
        this.mParentCon.y = size.height - 50;
    }
    public destroy() {

    }

    private createPanel() {
        this.mResStr = "bagView";
        this.mResPng = "resources/ui/bag/bagView.png";
        this.mResJson = "resources/ui/bag/bagView.json";
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
        let hei: number = 206;
        const preBtnSprite = this.mScene.make.sprite(undefined, false);
        preBtnSprite.setTexture(this.mResStr, "bagView_tab");
        wid += preBtnSprite.width;
        // ===============背包界面左翻按钮
        this.mPreBtn = (this.mScene.plugins.get("rexButton") as ButtonPlugin).add(preBtnSprite, {
            enable: true,
            mode: 1,
            clickInterval: 100
        });
        this.mParentCon.add(this.mPreBtn);
        // ================背包界面背景底
        const panelBg: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
       // panelBg.setTexture("resources/ui/common/common_panelBg");
        this.mNinePatch = (<any>this.mScene).add.rexNinePatch({
            x: 0,
            y: 0,
            width: 730,
            height: 206,
            key: "",
            columns: [8, 714, 8],
            rows: [9, 188, 9],
            stretchMode: 0
        });
        this.mParentCon.addAt(this.mNinePatch, 0);
        // ============背包格位
        let itemSlot: ItemSlot;
        // let tmpWid: number = 0;
        // let tmpHei: number = 0;
        const chilsList: any[] = [];
        let rowIndex: number = -1;
        for (let i: number = 0; i < 36; i++) {
            if (i % 12 === 0) {
                rowIndex++;
                chilsList[rowIndex] = [];
                hei += rowIndex * (52 + 5);
            }
            // tmpWid = i % 12 * 52 + 5;
            // tmpHei = Math.floor(i / 12) * 52;
            itemSlot = new ItemSlot(this.mScene, this.mParentCon, 0, 0, this.mResStr, this.mResPng, this.mResJson, "bagView_slot");
            this.bagSlotList.push(itemSlot);
            chilsList[rowIndex].push(itemSlot.con);
            if (i === 0) {
                wid += 52 + 5;
            }
        }

        for (let i: number = 0; i <= rowIndex; i++) {
            const buttons = (<any>this.mScene).rexUI.add.buttons({
                x: 0,
                y: 0,
                width: 52,
                height: 52,
                orientation: 0,
                buttons: chilsList[i],
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

            buttons.on("button.click", function (button, groupName, index, pointer) {
                Logger.debug(button);
            }, this);
        }

        // ===============背包界面右翻按钮
        const nextBtnSprite = this.mScene.make.sprite(undefined, false);
        nextBtnSprite.setTexture(this.mResStr, "bagView_tab");
        nextBtnSprite.scaleX = -1;

        this.mNextBtn = (this.mScene.plugins.get("rexButton") as ButtonPlugin).add(nextBtnSprite, {
            enable: true,
            mode: 1,
            clickInterval: 100
        });
        wid += nextBtnSprite.width;
        this.mParentCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, wid, hei), Phaser.Geom.Rectangle.Contains);
        this.mParentCon.add(this.mNextBtn);
        if (!this.mScene.cache.obj.has("clsBtn")) {
            this.mScene.load.atlas("clsBtn", "resources/ui/common/common_clsBtn.png", "resources/ui/common/common_clsBtn.json");
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onClsLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onClsLoadCompleteHandler();
        }

    }

    private onClsLoadCompleteHandler() {
        const clsBtnSprite = this.mScene.make.sprite(undefined, false);
        clsBtnSprite.setTexture("clsBtn", "btn_normal");

        // ===============背包界面左翻按钮
        const clsBtn = (this.mScene.plugins.get("rexButton") as ButtonPlugin).add(clsBtnSprite, {
            enable: true,
            mode: 1,
            clickInterval: 100
        });
        this.mParentCon.add(clsBtn);
    }
}
