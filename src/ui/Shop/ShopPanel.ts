import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { ItemSlot } from "../bag/item.slot";
import { ShopItemSlot } from "./shop.itemSlot";
import { Logger } from "../../utils/log";
import { Size } from "../../utils/size";

export class ShopPanel extends Panel {
    public static ShopSlotCount: number = 20;
    public mClsBtnSprite: Phaser.GameObjects.Sprite;
    private mWorld: WorldService;
    private mShopItemSlotList: ShopItemSlot[];
    private mDataList: any[];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width >> 1;
        this.y = size.height - 300;
    }

    public setDataList(value: any[]) {
        this.mDataList = value;
        if (!this.mInitialized) {
            return;
        }
        this.refreshDataList();
    }

    public destroy() {
        if (this.mShopItemSlotList) {
            this.mShopItemSlotList.forEach((slot: ShopItemSlot) => {
                if (slot) slot.destroy();
            });
            this.mShopItemSlotList.length = 0;
            this.mShopItemSlotList = null;
        }
        if (this.mDataList) {
            this.mDataList.length = 0;
            this.mDataList = null;
        }
        this.mInitialized = false;
        super.destroy();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.atlas("shopView", Url.getRes("ui/shop/shopView.png"), Url.getRes("ui/shop/shopView.json"));
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width >> 1;
        this.y = size.height - 300;
        const mBg: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        mBg.setTexture("shopView", "shopView_bg");
        mBg.x = 0;
        mBg.y = 0;
        this.setSize(mBg.width, mBg.height);
        this.addAt(mBg, 0);

        const titleCon: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        titleCon.setTexture("shopView", "shopView_titleIcon");
        titleCon.x = (-mBg.width >> 1) + 35;
        titleCon.y = -mBg.height >> 1;
        this.add(titleCon);
        const titleTF: Phaser.GameObjects.Text = this.mScene.make.text(undefined, false);

        titleTF.setFontFamily("Tahoma");
        titleTF.setFontStyle("bold");
        titleTF.setFontSize(20);
        titleTF.setText("内购商城");
        titleTF.x = titleCon.x + titleCon.width - 10;
        titleTF.y = titleCon.y - (titleTF.height >> 1);
        this.add(titleTF);
        this.mShopItemSlotList = [];
        let itemSlot: ShopItemSlot;
        let tmpX: number;
        let tmpY: number;
        for (let i: number = 0; i < 20; i++) {
            tmpX = (i % 5) * 100 - mBg.width / 2 + 75;
            tmpY = Math.floor(i / 5) * 90 - mBg.height / 2 + 80;
            itemSlot = new ShopItemSlot(this.mScene, this.mWorld, this, tmpX, tmpY, "shopView", "ui/shop/shopView.png", "ui/shop/shopView.json", "shopView_bagSlot", null, null);
            itemSlot.createUI();
            this.mShopItemSlotList.push(itemSlot);
        }
        if (!this.mScene.cache.obj.has("clsBtn")) {
            this.mScene.load.spritesheet("clsBtn", "resources/ui/common/common_clsBtn.png", { frameWidth: 16, frameHeight: 16, startFrame: 1, endFrame: 3 });
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onClsLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onClsLoadCompleteHandler();
        }
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);

        // 异步加载过程中会导致数据过来，面板仍然没有加载完毕，所以缓存数据等ui加载完毕再做显示
        if (this.mDataList) {
            this.refreshDataList();
        }
        super.init();
    }

    private onClsLoadCompleteHandler() {
        this.mClsBtnSprite = this.mScene.make.sprite(undefined, false);
        this.mClsBtnSprite.setTexture("clsBtn", "btn_normal");
        this.mClsBtnSprite.x = (this.width >> 1) - 65;
        this.mClsBtnSprite.y = (- this.height >> 1);
        this.mClsBtnSprite.setInteractive();
        this.mClsBtnSprite.on("pointerup", this.hide, this);
        this.add(this.mClsBtnSprite);
    }

    private refreshDataList() {
        if (!this.mDataList) {
            Logger.getInstance().error("this.mDataList is undefiend");
            return;
        }
        const len = ShopPanel.ShopSlotCount;
        let item: ItemSlot;
        for (let i = 0; i < len; i++) {
            item = this.mShopItemSlotList[i];
            if (!item) continue;
            item.dataChange(this.mDataList[i]);
        }
    }
}
