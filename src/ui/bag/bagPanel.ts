import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { ItemSlot } from "./item.slot";
import { Size } from "../../utils/size";
import { Logger } from "../../utils/log";
import ButtonPlugin from "../../../lib/rexui/plugins/button-plugin.js";
import { Panel } from "../components/panel";

export class BagPanel extends Panel {
    public static PageMaxCount: number = 36;
    public isShow: boolean = false;
    public bagSlotList: ItemSlot[];
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mWorld: WorldService;
    private mPreBtn: Phaser.GameObjects.Sprite;
    private mNextBtn: Phaser.GameObjects.Sprite;
    private mClsBtnSprite: Phaser.GameObjects.Sprite;
    private mParentCon: Phaser.GameObjects.Container;
    private mPageNum: number = 0;
    private mPageIndex: number = 0;
    private mDataList: any[];
    private mWid: number = 0;
    private mHei: number = 0;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        this.bagSlotList = [];
    }

    public show(param: any) {
        if (this.isShow) {
            // this.hide();
            return;
        }
        this.isShow = true;
        this.createPanel();
        // todo refresh bagData
    }
    public update(param: any) {

    }
    public hide() {
        this.isShow = false;
        this.destroy();
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        if (this.mParentCon) {
            this.mParentCon.x = size.width >> 1;
            this.mParentCon.y = size.height - 200;
        }
    }

    public setDataList(value: any[]) {
        this.mPageNum = Math.ceil(value.length / BagPanel.PageMaxCount);
        this.mDataList = value;
        this.refreshDataList();
    }

    public destroy() {
        if (this.mParentCon) this.mParentCon.destroy();
    }

    private createPanel() {
        this.mResStr = "bagView";
        this.mResPng = "./resources/ui/bag/bagView.png";
        this.mResJson = "./resources/ui/bag/bagView.json";
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
        const hei: number = 206;
        const size: Size = this.mWorld.getSize();
        // ===============背包界面左翻按钮
        this.mParentCon = this.mScene.add.container(size.width >> 1, size.height - 200);
        this.mPreBtn = this.mScene.make.sprite(undefined, false);
        this.mPreBtn.setTexture(this.mResStr, "bagView_tab");
        this.mPreBtn.x = -380;
        wid += this.mPreBtn.width;
        this.mParentCon.add(this.mPreBtn);

        // ============背包格位
        let itemSlot: ItemSlot;
        let tmpX: number = 0;
        let tmpY: number = 0;
        const chilsList: any[] = [];
        let rowIndex: number = -1;
        const slotCon: Phaser.GameObjects.Container = this.mScene.make.container(undefined, false);
        slotCon.x = 0;
        slotCon.y = 0;
        slotCon.setSize(11 * 52 + 10 * 8, 11 * 52 + 10 * 5);
        this.mParentCon.add(slotCon);
        for (let i: number = 0; i < 36; i++) {
            if (i % 12 === 0) {
                rowIndex++;
                chilsList[rowIndex] = [];
            }
            tmpX = i % 12 * 52 + 20;
            itemSlot = new ItemSlot(this.mScene, slotCon, tmpX, 0, this.mResStr, this.mResPng, this.mResJson, "bagView_slot", "bagView_itemSelect");
            this.bagSlotList.push(itemSlot);
            chilsList[rowIndex].push(itemSlot.con);
            if (i <= 11) {
                wid += 52 + 5;
            }
        }

        for (let i: number = 0; i <= rowIndex; i++) {
            tmpY = i * (52 + 8) - 52;
            const buttons = (<any> this.mScene).rexUI.add.buttons({
                x: 0,
                y: tmpY,
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
                space: 8,
                name: "bag",
            });
            buttons.layout();

            buttons.on("button.click", function(button, groupName, index, pointer) {
                Logger.debug(button);
            }, this);
        }
        // ================背包界面背景底
        this.mParentCon.addAt(this.createTexture(), 0);

        // // ===============背包界面右翻按钮
        this.mNextBtn = this.mScene.make.sprite(undefined, false);
        this.mNextBtn.setTexture(this.mResStr, "bagView_tab");
        this.mNextBtn.scaleX = -1;
        this.mNextBtn.x = 380;
        wid += this.mNextBtn.width;
        const titleCon: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        titleCon.setTexture(this.mResStr, "bagView_titleBtn");
        titleCon.x = (- wid >> 1) + 80;
        titleCon.y = (-hei >> 1);
        this.mParentCon.add(titleCon);
        const titleTF: Phaser.GameObjects.Text = this.mScene.make.text(undefined, false);

        titleTF.setFontFamily("Tahoma");
        titleTF.setFontStyle("bold");
        titleTF.setFontSize(20);
        titleTF.setText("背包");
        titleTF.x = titleCon.x + titleCon.width - 10;
        titleTF.y = titleCon.y - (titleTF.height >> 1);
        this.mParentCon.add(titleTF);
        this.mParentCon.add(this.mNextBtn);
        this.mNextBtn.setInteractive();
        this.mPreBtn.setInteractive();
        this.mNextBtn.on("pointerup", this.nextHandler, this);
        this.mPreBtn.on("pointerup", this.preHandler, this);
        this.mWid = wid;
        this.mHei = hei;
        if (!this.mScene.cache.obj.has("clsBtn")) {
            this.mScene.load.spritesheet("clsBtn", "resources/ui/common/common_clsBtn.png", { frameWidth: 16, frameHeight: 16, startFrame: 1, endFrame: 3 });
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onClsLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onClsLoadCompleteHandler();
        }
    }

    private nextHandler(pointer, gameObject) {
        if (this.mPageIndex < this.mPageNum - 1) {
            this.mPageIndex++;
        }
        this.preNextBtnScaleHandler(this.mNextBtn, -1);
        this.refreshDataList();
    }

    private preHandler(pointer, gameObject) {
        if (this.mPageIndex > 0) {
            this.mPageIndex--;
        }
        this.preNextBtnScaleHandler(this.mPreBtn);
        this.refreshDataList();
    }

    private preNextBtnScaleHandler(gameObject: Phaser.GameObjects.Sprite, scaleX: number = 1) {
        this.mScene.tweens.add({
            targets: gameObject,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 * scaleX },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        gameObject.scaleX = scaleX;
        gameObject.scaleY = 1;
    }

    private refreshDataList() {
        if (!this.mDataList) {
            Logger.error("this.mDataList is undefiend");
            return;
        }
        const items = this.mDataList.slice((this.mPageIndex - 1) * BagPanel.PageMaxCount, this.mPageIndex * BagPanel.PageMaxCount);
        const len = this.bagSlotList.length;
        let item: ItemSlot;
        for (let i = 0; i < len; i++) {
            item = this.bagSlotList[i];
            if (!item) continue;
            item.dataChange(items[i]);
        }
    }

    private createTexture(): Phaser.GameObjects.Graphics {
        const COLOR_BG = 0x706B6B;
        const COLOR_LINE = 0x000000;
        const width = 730;
        const height = 206;
        const bgGraphics: Phaser.GameObjects.Graphics = this.mScene.add.graphics();
        bgGraphics.fillStyle(COLOR_BG, .8);
        bgGraphics.fillRect((-width >> 1) + 3, (-height >> 1) + 1, width - 6, height - 6);
        bgGraphics.lineStyle(3, COLOR_LINE, .8);
        bgGraphics.strokeRect(-width >> 1, -height >> 1, width, height);
        return bgGraphics;
    }

    private onClsLoadCompleteHandler() {
        this.mClsBtnSprite = this.mScene.make.sprite(undefined, false);
        this.mClsBtnSprite.setTexture("clsBtn", "btn_normal");
        this.mClsBtnSprite.x = (this.mWid >> 1) - 65;
        this.mClsBtnSprite.y = (-this.mHei >> 1);

        // ===============背包界面左翻按钮
        this.mClsBtnSprite.setInteractive();
        this.mClsBtnSprite.on("pointerup", this.hide, this);
        this.mParentCon.add(this.mClsBtnSprite);
    }
}
