import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { ShopItemSlot } from "./shop.itemSlot";
import { Logger } from "../../utils/log";
import { Size } from "../../utils/size";
import { op_client } from "pixelpai_proto";
import { ShopMediator } from "./ShopMediator";

export class ShopPanel extends Panel {
    public static ShopSlotCount: number = 20;
    public mClsBtnSprite: Phaser.GameObjects.Sprite;
    private mShopItemSlotList: ShopItemSlot[];
    private mShopData: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mWorld = world;
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width >> 1;
            this.y = size.height - 300;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            } else {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            }
        }

        this.scaleX = this.scaleY = this.mWorld.uiScale;
    }

    public setDataList(value: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE) {
        this.mShopData = value;
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
        this.mShopData = null;
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
        const mBg: Phaser.GameObjects.Sprite = this.mScene.make.sprite(undefined, false);
        mBg.setTexture("shopView", "shopView_bg");
        mBg.x = 0;
        mBg.y = 0;
        this.setSize(mBg.width, mBg.height);
        this.addAt(mBg, 0);
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width >> 1;
            this.y = size.height - 300;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            } else {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            }
        }
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
        if (this.mShopData) {
            this.refreshDataList();
        }
        super.init();
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) this.resize();
    }

    private onClsLoadCompleteHandler() {
        this.mClsBtnSprite = this.mScene.make.sprite(undefined, false);
        this.mClsBtnSprite.setTexture("clsBtn", "btn_normal");
        this.mClsBtnSprite.x = (this.width >> 1) - 65;
        this.mClsBtnSprite.y = (- this.height >> 1);
        this.mClsBtnSprite.setInteractive();
        this.mClsBtnSprite.on("pointerup", this.shopMedClose, this);
        this.add(this.mClsBtnSprite);
    }

    private refreshDataList() {
        if (!this.mShopData) {
            Logger.getInstance().error("this.mDataList is undefiend");
            return;
        }
        const len = ShopPanel.ShopSlotCount;
        let item: ShopItemSlot;
        for (let i = 0; i < len; i++) {
            item = this.mShopItemSlotList[i];
            if (!item) continue;
            item.shopDataChange(this.mShopData.items[i], this.mShopData.id);
        }
    }

    private shopMedClose() {
        const med = this.mWorld.uiManager.getMediator(ShopMediator.NAME) as ShopMediator;
        if (med) {
            med.hide();
            return;
        }
        this.hide();
    }
}
