import { WorldService } from "../../../game/world.service";
import { ItemSlot } from "../item.slot";
import { Size } from "../../../utils/size";
import { Logger } from "../../../utils/log";
import { Panel } from "../../components/panel";
import { Url } from "../../../utils/resUtil";

export class BagPanel extends Panel {
    public static PageMaxCount: number = 36;
    public bagSlotList: ItemSlot[];
    public mPreBtn: Phaser.GameObjects.Sprite;
    public mNextBtn: Phaser.GameObjects.Sprite;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mWorld: WorldService;
    private mClsBtnSprite: Phaser.GameObjects.Sprite;
    private mParentCon: Phaser.GameObjects.Container;
    private mPageNum: number = 0;
    private mPageIndex: number = 1;
    private mDataList: any[];
    // private mInitalize: boolean = false;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mScene = scene;
        this.mWorld = world;
        this.bagSlotList = [];
    }

    public update(param: any) {

    }
    public hide() {
        this.mShowing = false;
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
        if (!this.mInitialized) {
            return;
        }
        this.refreshDataList();
    }

    public getPageNum(): number {
        return this.mPageNum;
    }

    public destroy() {
        if (this.bagSlotList) {
            this.bagSlotList.forEach((slot: ItemSlot) => {
                if (slot) slot.destory();
            });
            this.bagSlotList.length = 0;
            this.bagSlotList = null;
        }
        if (this.mDataList) {
            this.mDataList.length = 0;
            this.mDataList = null;
        }
        if (this.mParentCon) {
            this.mParentCon.destroy();
        }
        this.mInitialized = false;
    }

    public getCurPageIndex(): number {
        return this.mPageIndex;
    }

    protected init() {
        if (this.mInitialized) return;
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
        // 多排背包格位
        this.bagSlotList = [];
        for (let i: number = 0; i < 36; i++) {
            tmpX = i % 12 * 60 + 32 - 724 / 2;
            tmpY = Math.floor(i / 12) * 60 - 55;
            itemSlot = new ItemSlot(this.mScene, this.mWorld, this.mParentCon, tmpX, tmpY, this.mResStr, this.mResPng, this.mResJson, "bagView_slot", "bagView_itemSelect");
            itemSlot.createUI();
            this.bagSlotList.push(itemSlot);
            if (i <= 11) {
                wid += 52 + 5;
            }
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
        this.mWidth = wid;
        this.mHeight = hei;
        if (!this.mScene.cache.obj.has("clsBtn")) {
            this.mScene.load.spritesheet("clsBtn", "resources/ui/common/common_clsBtn.png", { frameWidth: 16, frameHeight: 16, startFrame: 1, endFrame: 3 });
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onClsLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onClsLoadCompleteHandler();
        }
        this.mInitialized = true;
        if (this.mDataList) {
            this.refreshDataList();
        }
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mResStr = "bagView";
        this.mResPng = "ui/bag/bagView.png";
        this.mResJson = "ui/bag/bagView.json";
        this.mScene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
        super.preload();
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        if (this.mInitialized) {
            return;
        }
        this.init();
    }

    private nextHandler(pointer, gameObject) {
        this.preNextBtnScaleHandler(this.mNextBtn, -1);
        if (this.mPageIndex >= this.mPageNum) {
            return;
        }
        this.mPageIndex++;
        this.refreshDataList();
    }

    private preHandler(pointer, gameObject) {
        this.preNextBtnScaleHandler(this.mPreBtn);
        if (this.mPageIndex <= 1) {
            return;
        }
        this.mPageIndex--;
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
        const len = BagPanel.PageMaxCount;
        let item: ItemSlot;
        for (let i = 0; i < len; i++) {
            item = this.bagSlotList[i];
            if (!item) continue;
            item.dataChange(items[i]);
        }
    }

    private createTexture(): Phaser.GameObjects.Graphics {
        const COLOR_BG = 0xAAA9A9;
        const COLOR_LINE = 0x000000;
        const width = 730;
        const height = 206;
        const bgGraphics: Phaser.GameObjects.Graphics = this.mScene.add.graphics();
        bgGraphics.fillStyle(COLOR_BG, .5);
        bgGraphics.fillRect((-width >> 1) + 3, (-height >> 1) + 1, width - 6, height - 6);
        bgGraphics.lineStyle(3, COLOR_LINE, .8);
        bgGraphics.strokeRect(-width >> 1, -height >> 1, width, height);
        return bgGraphics;
    }

    private onClsLoadCompleteHandler() {
        this.mClsBtnSprite = this.mScene.make.sprite(undefined, false);
        this.mClsBtnSprite.setTexture("clsBtn", "btn_normal");
        this.mClsBtnSprite.x = (this.mWidth >> 1) - 65;
        this.mClsBtnSprite.y = (-this.mHeight >> 1);

        // ===============背包界面左翻按钮
        this.mClsBtnSprite.setInteractive();
        this.mClsBtnSprite.on("pointerup", this.hide, this);
        this.mParentCon.add(this.mClsBtnSprite);
    }
}
