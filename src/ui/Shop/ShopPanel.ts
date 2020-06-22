import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Url, Border, Background } from "../../utils/resUtil";
import { ShopItemSlot } from "./shop.itemSlot";
import { Size } from "../../utils/size";
import { op_client } from "pixelpai_proto";
import { ShopMediator } from "./ShopMediator";
import { NinePatch } from "tooqingui";
import { IconBtn } from "../baseView/icon.btn";
import { UIMediatorType } from "../ui.mediatorType";

export class ShopPanel extends BasePanel {
    public static ShopSlotCount: number = 20;
    public mClsBtn: IconBtn;
    private mShopItemSlotList: ShopItemSlot[];
    private mShopData: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QUERY_PACKAGE;
    private mBg: NinePatch;
    private mBorder: NinePatch;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.mWorld = world;
    }

    public resize(wid: number, hei: number) {
        const size: Size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width + wid >> 1;
            this.y = size.height + hei >> 1;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width + wid >> 1;
                this.y = size.height + hei >> 1;
            } else {
                this.x = size.width + wid >> 1;
                this.y = size.height + hei >> 1;
            }
        }

        this.scale = this.mWorld.uiScale;
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

    public addListen() {
        if (!this.mInitialized) return;
        this.mClsBtn.on("pointerup", this.shopMedClose, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.mClsBtn.off("pointerup", this.shopMedClose, this);
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mScene.load.image(Border.getName(), Border.getPNG());
        this.mScene.load.image(Background.getName(), Background.getPNG());
        this.mScene.load.atlas("itemChose", Url.getRes("ui/bag/itemChose.png"), Url.getRes("ui/bag/itemChose.json"));
        this.mScene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
        this.mScene.load.atlas("shopView", Url.getRes("ui/shop/shopView.png"), Url.getRes("ui/shop/shopView.json"));
        super.preload();
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        const selectFramesObj: {} = this.mScene.textures.get("itemChose").frames;
        const tmpSelectFrames: any[] = [];
        for (const key in selectFramesObj) {
            if (key === "__BASE") continue;
            const frame = selectFramesObj[key];
            if (!frame) continue;
            tmpSelectFrames.push(key);
        }
        // 手动把json配置中的frames给予anims
        this.mScene.anims.create({
            key: "itemSelectFrame",
            frames: this.mScene.anims.generateFrameNumbers("itemChose", { start: 0, end: 8, frames: tmpSelectFrames }),
            frameRate: 33,
            yoyo: true,
            repeat: -1
        });
        super.loadComplete(loader, totalComplete, totalFailed);
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        this.mBg = new NinePatch(this.scene, 0, 0, 500, 350, Background.getName(), null, undefined, undefined, Background.getConfig());
        this.mBg.x = 0;
        this.mBg.y = 0;
        this.setSize(this.mBg.width, this.mBg.height);
        this.addAt(this.mBg, 0);

        this.mBorder = new NinePatch(this.scene, 0, 0, this.mBg.width - 10, this.mBg.height - 30, Border.getName(), null, undefined, undefined, Border.getConfig());
        this.mBorder.x = this.mBg.x;
        this.mBorder.y = this.mBg.y + 10;
        this.addAt(this.mBorder, 1);

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
        titleCon.x = (-this.mBg.width >> 1) + 35;
        titleCon.y = -this.mBg.height >> 1;
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
            tmpX = (i % 5) * 88 - this.mBg.width / 2 + 75;
            tmpY = Math.floor(i / 5) * 82 - this.mBg.height / 2 + 72;
            itemSlot = new ShopItemSlot(this.mScene, this.mWorld, this, tmpX, tmpY, "shopView", "ui/shop/shopView.png", "ui/shop/shopView.json", "shopView_bagSlot", "itemSelectFrame");
            itemSlot.createUI();
            this.mShopItemSlotList.push(itemSlot);
        }
        this.mClsBtn = new IconBtn(this.mScene, this.mWorld, {
            key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
            iconResKey: "", iconTexture: "", scale: 1, pngUrl: "ui/shop/shopView.png", jsonUrl: "ui/shop/shopView.json"
        });
        this.mClsBtn.x = (this.width >> 1) - 65;
        this.mClsBtn.y = -this.height >> 1;
        this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
        this.add(this.mClsBtn);
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);

        // 异步加载过程中会导致数据过来，面板仍然没有加载完毕，所以缓存数据等ui加载完毕再做显示
        if (this.mShopData) {
            this.refreshDataList();
        }
        super.init();
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) this.mWorld.uiManager.getMediator(ShopMediator.NAME).resize();
    }

    private refreshDataList() {
        if (!this.mShopData) {
            // Logger.getInstance().error("this.mDataList is undefiend");
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
        const med = this.mWorld.uiManager.getMediator(ShopMediator.NAME);
        med.hide();
    }
}
