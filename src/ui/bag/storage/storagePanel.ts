import { ItemSlot } from "../item.slot";
import { Size } from "../../../utils/size";
import { WorldService } from "../../../game/world.service";
import { Url, Border, Background } from "../../../utils/resUtil";
import { IconBtn } from "../../baseView/icon.btn";
import { NinePatch } from "tooqingui";
import { StorageMediator } from "./storageMediator";
import { UIMediatorType } from "../../ui.mediatorType";
import { BasePanel } from "../../components/BasePanel";

export class StoragePanel extends BasePanel {
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
    public destroy() {
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

    public addListen() {
        this.mClsBtn.on("pointerup", this.hide, this);
    }

    public removeListen() {
        this.mClsBtn.off("pointerup", this.hide, this);
    }

    protected init() {
        if (this.mInitialized) return;
        super.init();
        this.mBg = new NinePatch(this.scene, 0, 0, 500, 350, Background.getName(), null, undefined, undefined, Background.getConfig());
        this.addAt(this.mBg, 0);
        this.setSize(this.mBg.width, this.mBg.height);
        this.mBorder = new NinePatch(this.scene, 0, 0, this.mBg.width - 10, this.mBg.height - 30, Border.getName(), null, undefined, undefined, Border.getConfig());
        this.mBorder.x = this.mBg.x;
        this.mBorder.y = this.mBg.y + 10;
        this.addAt(this.mBorder, 1);
        this.setSize(this.mBg.width, this.mBg.height);
        const titleIcon: Phaser.GameObjects.Image = this.scene.make.image(undefined, false);
        titleIcon.setTexture(this.mResStr, "itemBagView_title.png");
        titleIcon.x = (-this.mBg.width >> 1) + 80;
        titleIcon.y = -this.mBg.height >> 1;
        this.add(titleIcon);

        const titleTF: Phaser.GameObjects.Text = this.scene.make.text(undefined, false);
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
            itemSlot = new ItemSlot(this.scene, this.mWorld, this, tmpX, tmpY, this.mResStr, this.mResPng, this.mResJson, "bagView_slot.png", "bagView_itemSelect.png");
            itemSlot.createUI();
            this.mBagItemSlotList.push(itemSlot);
        }

        this.mClsBtn = new IconBtn(this.scene, this.mWorld, {
            key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
            iconResKey: "", iconTexture: "", scale: 1, pngUrl: "ui/common/common_clsBtn.png", jsonUrl: "ui/common/common_clsBtn.json"
        });
        this.mClsBtn.x = (this.width >> 1) - 65;
        this.mClsBtn.y = -this.height >> 1;
        this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
        this.add(this.mClsBtn);
    }

    protected preload() {
        if (!this.scene) {
            return;
        }
        this.mResStr = "bagView";
        this.mResPng = "ui/bag/bagView.png";
        this.mResJson = "ui/bag/bagView.json";
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
        this.scene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
        super.preload();
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) this.mWorld.uiManager.getMediator(StorageMediator.NAME).resize();
    }
}
