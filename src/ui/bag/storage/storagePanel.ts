import { Panel } from "../../components/panel";
import { ItemSlot } from "../item.slot";
import { Size } from "../../../utils/size";
import { WorldService } from "../../../game/world.service";
import { Url, Border, Background } from "../../../utils/resUtil";
import { IconBtn } from "../../baseView/icon.btn";
import { NinePatch } from "../../components/nine.patch";
import { StorageMediator } from "./storageMediator";
import { UIMediatorType } from "../../ui.mediatorType";

export class StoragePanel extends Panel {
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mBagItemSlotList: ItemSlot[];
    private mClsBtn: IconBtn;
    private mBg: NinePatch;
    private mBorder: NinePatch;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    public resize(wid: number, hei: number) {
        const size: Size = this.mWorld.getSize();
        this.x = size.width + wid >> 1;
        this.y = size.height + hei - 200;
    }
    public show(param: any) {
        super.show(param);
    }
    public update(param: any) {
        super.update(param);
    }
    public destroy() {
        if (this.mBg) {
            this.mBg.destroy(true);
            this.mBg = null;
        }
        if (this.mBorder) {
            this.mBorder.destroy(true);
            this.mBorder = null;
        }
        if (this.mClsBtn) {
            this.mClsBtn.destroy();
            this.mClsBtn = null;
        }
        if (this.mBagItemSlotList) {
            const len: number = this.mBagItemSlotList.length;
            for (let i: number = 0; i < len; i++) {
                let item: ItemSlot = this.mBagItemSlotList[i];
                if (!item) continue;
                item.destroy();
                item = null;
            }
            this.mBagItemSlotList = null;
        }
        this.mWorld = null;
        super.destroy();
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        this.mBg = new NinePatch(this.scene, 0, 0, 500, 350, Background.getName(), null, Background.getConfig());
        this.addAt(this.mBg, 0);
        this.setSize(this.mBg.width, this.mBg.height);
        this.mBorder = new NinePatch(this.scene, 0, 0, this.mBg.width - 10, this.mBg.height - 30, Border.getName(), null, Border.getConfig());
        this.mBorder.x = this.mBg.x;
        this.mBorder.y = this.mBg.y + 10;
        this.addAt(this.mBorder, 1);
        this.mWidth = this.mBg.width;
        this.mHeight = this.mBg.height;
        const titleIcon: Phaser.GameObjects.Image = this.mScene.make.image(undefined, false);
        titleIcon.setTexture(this.mResStr, "itemBagView_title.png");
        titleIcon.x = (-this.mBg.width >> 1) + 80;
        titleIcon.y = -this.mBg.height >> 1;
        this.add(titleIcon);

        const titleTF: Phaser.GameObjects.Text = this.mScene.make.text(undefined, false);
        titleTF.setFontFamily("Tahoma");
        titleTF.setFontStyle("bold");
        titleTF.setFontSize(20);
        titleTF.setText("书柜");
        titleTF.x = titleIcon.x + titleIcon.width - 10;
        titleTF.y = titleIcon.y - (titleTF.height >> 1);
        this.add(titleTF);

        let itemSlot: ItemSlot;
        let tmpX: number = 0;
        let tmpY: number = 0;
        // 多排背包格位
        this.mBagItemSlotList = [];
        for (let i: number = 0; i < 9; i++) {
            tmpX = i % 9 * 60 + 32 - 724 / 2;
            tmpY = Math.floor(i / 9) * 60 - 55;
            itemSlot = new ItemSlot(this.mScene, this.mWorld, this, tmpX, tmpY, this.mResStr, this.mResPng, this.mResJson, "bagView_slot.png", "bagView_itemSelect.png");
            itemSlot.createUI();
            this.mBagItemSlotList.push(itemSlot);
        }

        this.mClsBtn = new IconBtn(this.mScene, this.mWorld, {
            key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
            iconResKey: "", iconTexture: "", scale: 1, pngUrl: "ui/common/common_clsBtn.png", jsonUrl: "ui/common/common_clsBtn.json"
        });
        this.mClsBtn.x = (this.mWidth >> 1) - 65;
        this.mClsBtn.y = -this.mHeight >> 1;
        this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
        this.mClsBtn.on("pointerup", this.hide, this);
        this.add(this.mClsBtn);
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mResStr = "bagView";
        this.mResPng = "ui/bag/bagView.png";
        this.mResJson = "ui/bag/bagView.json";
        this.mScene.load.image(Border.getName(), Border.getPNG());
        this.mScene.load.image(Background.getName(), Background.getPNG());
        this.mScene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
        this.mScene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
        super.preload();
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) (this.mWorld.uiManager.getMediator(StorageMediator.NAME) as StorageMediator).resize();
    }
}
