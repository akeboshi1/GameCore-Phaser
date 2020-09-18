import { WorldService } from "../../../game/world.service";
import { ItemSlot } from "../item.slot";
import { Size } from "../../../utils/size";
import { Logger } from "../../../utils/log";
import { Url, Border, Background } from "../../../utils/resUtil";
import { BagMediator } from "./bagMediator";
import { NinePatch } from "../../components/nine.patch";
import { Tool } from "../../../utils/tool";
import { op_gameconfig } from "pixelpai_proto";
import { IconBtn } from "../../baseView/icon.btn";
import { UIMediatorType } from "../../ui.mediatorType";
import { BasePanel } from "../../components/BasePanel";
import { InputText } from "apowophaserui";
export class BagPanel extends BasePanel {
    public static PageMaxCount: number = 32;
    public bagSlotList: ItemSlot[];
    public mPreBtn: Phaser.GameObjects.Sprite;
    public mNextBtn: Phaser.GameObjects.Sprite;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mClsBtn: IconBtn;
    private mPageNum: number = 0;
    private mPageIndex: number = 1;
    private mDataList: any[];
    private mBg: NinePatch;
    private mBorder: NinePatch;
    private mInputText: InputText;
    private mBaseStr: string = "输入关键字进行搜索";
    private mCheckList: op_gameconfig.IItem[];
    // private mInitalize: boolean = false;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.bagSlotList = [];
        this.mCheckList = [];
    }

    public resize(wid: number, hei: number) {
        const size: Size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width >> 1;
            this.y = size.height >> 1;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            } else {
                this.x = size.width >> 1;
                this.y = size.height - (this.height / 2) * this.mWorld.uiScale >> 1;
            }
        }
    }

    public setDataList() {
        const itemList: op_gameconfig.IItem[] = this.mWorld.roomManager.currentRoom.playerManager.actor.package.items;
        this.mPageNum = Math.ceil(itemList.length / BagPanel.PageMaxCount);
        this.mDataList = itemList;
        if (!this.mInitialized) {
            return;
        }
        this.checkChinese();
    }

    public getPageNum(): number {
        return this.mPageNum;
    }

    public destroy() {
        if (this.bagSlotList) {
            this.bagSlotList.forEach((slot: ItemSlot) => {
                if (slot) slot.destroy();
            });
            this.bagSlotList.length = 0;
            this.bagSlotList = null;
        }
        this.mWorld = null;
        this.mPageNum = 0;
        this.mPageIndex = 1;
        super.destroy();
    }

    public getCurPageIndex(): number {
        return this.mPageIndex;
    }

    public show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.mPreBtn.play("slipBtn");
            this.mNextBtn.play("slipBtn");
        }
    }

    public setBlur() {
        if (this.mInputText) this.mInputText.setBlur();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.mInputText.on("focus", this.onFocusHandler, this);
        this.mInputText.on("blur", this.onBlurHandler, this);
        this.mNextBtn.on("pointerup", this.nextHandler, this);
        this.mPreBtn.on("pointerup", this.preHandler, this);
        this.mClsBtn.on("pointerup", this.closeHandler, this);
    }
    public removeListen() {
        if (!this.mInitialized) return;
        this.mInputText.off("focus", this.onFocusHandler, this);
        this.mInputText.off("blur", this.onBlurHandler, this);
        this.mNextBtn.off("pointerup", this.nextHandler, this);
        this.mPreBtn.off("pointerup", this.preHandler, this);
        this.mClsBtn.off("pointerup", this.closeHandler, this);
    }

    protected init() {
        if (this.mInitialized) return;
        const size: Size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width >> 1;
            this.y = size.height >> 1;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.x = size.width >> 1;
                this.y = size.height >> 1;
            } else {
                this.x = size.width >> 1;
                this.y = size.height - (this.height / 2) * this.mWorld.uiScale >> 1;
            }
        }

        // ============背包格位
        let itemSlot: ItemSlot;
        let tmpX: number = 0;
        let tmpY: number = 0;
        // ================背包界面背景底
        this.mBg = new NinePatch(this.scene, 0, 0, 500, 350, Background.getName(), null, Background.getConfig());
        // this.mBg.x = size.width - this.width >> 1;
        // this.mBg.y = size.height - this.mBg.height >> 1;
        this.addAt(this.mBg, 0);
        this.setSize(this.mBg.width, this.mBg.height);

        this.mBorder = new NinePatch(this.scene, 0, 0, this.mBg.width - 10, this.mBg.height - 30, Border.getName(), null, Border.getConfig());
        this.mBorder.x = this.mBg.x;
        this.mBorder.y = this.mBg.y + 10;
        this.addAt(this.mBorder, 1);

        const txtBg: NinePatch = new NinePatch(this.scene, this.mBorder.width / 4 + 5, -this.mBg.height / 2 + 65, this.mBorder.width / 2 - 40, 35, Border.getName(), null, Border.getConfig());
        this.add(txtBg);

        this.mInputText = new InputText(this.scene, 0, 0, 10, 10, {
            type: "input",
            fontSize: "14px",
            color: "#808080"
        })
            .resize(txtBg.width, txtBg.height)
            .setOrigin(0, 0)
            .setStyle({ font: "bold 16px YaHei" });
        this.mInputText.x = txtBg.x - txtBg.width / 2;
        this.mInputText.y = txtBg.y - txtBg.height / 2;
        this.mInputText.setText(this.mBaseStr);
        this.add(this.mInputText);
        // 多排背包格位
        this.bagSlotList = [];
        for (let i: number = 0; i < BagPanel.PageMaxCount; i++) {
            tmpX = i % 8 * 60 - 210;
            tmpY = Math.floor(i / 8) * 60 - this.mBorder.height / 2 + this.mBorder.y + this.mBorder.height / 2 - 55;
            itemSlot = new ItemSlot(this.scene, this.mWorld, this, tmpX, tmpY, this.mResStr, this.mResPng, this.mResJson, "bagView_slot.png", "itemSelectFrame");
            itemSlot.createUI();
            this.bagSlotList.push(itemSlot);
        }
        this.mPreBtn = this.scene.make.sprite(undefined, false);
        this.mPreBtn.x = -this.mBg.width >> 1;
        // // ===============背包界面右翻按钮
        this.mNextBtn = this.scene.make.sprite(undefined, false);
        this.mNextBtn.scaleX = -1;
        this.mNextBtn.x = this.mBg.width >> 1;
        const titleCon: Phaser.GameObjects.Sprite = this.scene.make.sprite(undefined, false);
        titleCon.setTexture(this.mResStr, "bagView_titleBtn.png");
        titleCon.x = (-this.mBg.width >> 1) + 50;
        titleCon.y = (-this.mBg.height >> 1);
        this.add(titleCon);
        const titleTF: Phaser.GameObjects.Text = this.scene.make.text(undefined, false);

        titleTF.setFontFamily("Tahoma");
        titleTF.setFontStyle("bold");
        titleTF.setFontSize(20);
        titleTF.setText("背包");
        titleTF.x = titleCon.x + titleCon.width - 10;
        titleTF.y = titleCon.y - (titleTF.height >> 1);
        this.add(titleTF);
        this.add(this.mPreBtn);
        this.add(this.mNextBtn);
        this.mNextBtn.setInteractive();
        this.mPreBtn.setInteractive();
        this.width = this.mBg.width;
        this.height = this.mBg.height;
        this.mClsBtn = new IconBtn(this.scene, this.mWorld, {
            key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
            iconResKey: "", iconTexture: "", scale: 1, pngUrl: this.mResPng, jsonUrl: this.mResJson
        });
        this.mClsBtn.x = (this.width >> 1) - 65;
        this.mClsBtn.y = -this.height >> 1;
        this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
        this.add(this.mClsBtn);
        this.mInitialized = true;
        if (this.mDataList) {
            this.refreshDataList(this.mDataList);
        }
        this.setInteractive();
        (this.mWorld.uiManager.getMediator(BagMediator.NAME) as BagMediator).resize(this.width, this.height);
        super.init();
    }

    protected preload() {
        if (!this.scene) {
            return;
        }
        this.mResStr = "bagView";
        this.mResPng = "ui/bag/bagView.png";
        this.mResJson = "ui/bag/bagView.json";
        this.scene.load.atlas("itemChose", Url.getRes("ui/bag/itemChose.png"), Url.getRes("ui/bag/itemChose.json"));
        this.scene.load.atlas("slip", Url.getRes("ui/bag/slip.png"), Url.getRes("ui/bag/slip.json"));
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
        this.scene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
        super.preload();
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        const selectFramesObj: {} = this.scene.textures.get("itemChose").frames;
        const tmpSelectFrames: any[] = [];
        for (const key in selectFramesObj) {
            if (key === "__BASE") continue;
            const frame = selectFramesObj[key];
            if (!frame) continue;
            tmpSelectFrames.push(key);
        }
        // 手动把json配置中的frames给予anims
        this.scene.anims.create({
            key: "itemSelectFrame",
            frames: this.scene.anims.generateFrameNumbers("itemChose", { start: 0, end: 8, frames: tmpSelectFrames }),
            frameRate: 33,
            yoyo: true,
            repeat: -1
        });
        const framesObj: {} = this.scene.textures.get("slip").frames;
        const tmpFrames: any[] = [];
        for (const key in framesObj) {
            if (key === "__BASE") continue;
            const frame = framesObj[key];
            if (!frame) continue;
            tmpFrames.push(key);
        }
        // 手动把json配置中的frames给予anims
        this.scene.anims.create({
            key: "slipBtn",
            frames: this.scene.anims.generateFrameNumbers("slip", { start: 0, end: 14, frames: tmpFrames }),
            frameRate: 33,
            yoyo: true,
            repeat: -1
        });
        super.loadComplete(loader, totalComplete, totalFailed);
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) (this.mWorld.uiManager.getMediator(BagMediator.NAME) as BagMediator).resize(this.width, this.height);
    }

    private nextHandler(pointer, gameObject) {
        this.preNextBtnScaleHandler(this.mNextBtn, -1);
        if (this.mPageIndex >= this.mPageNum) {
            return;
        }
        this.mPageIndex++;
        const list = this.mCheckList.length > 0 ? this.mCheckList : this.mDataList;
        this.refreshDataList(list);
    }

    private preHandler(pointer, gameObject) {
        this.preNextBtnScaleHandler(this.mPreBtn);
        if (this.mPageIndex <= 1) {
            return;
        }
        this.mPageIndex--;
        const list = this.mCheckList.length > 0 ? this.mCheckList : this.mDataList;
        this.refreshDataList(list);
    }

    private preNextBtnScaleHandler(gameObject: Phaser.GameObjects.Sprite, scaleX: number = 1) {
        this.scene.tweens.add({
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

    private refreshDataList(checkItemList: op_gameconfig.IItem[]) {
        if (!checkItemList) {
            Logger.getInstance().error("checkItemList is undefiend");
            return;
        }
        const items = checkItemList.slice((this.mPageIndex - 1) * BagPanel.PageMaxCount, this.mPageIndex * BagPanel.PageMaxCount);
        const len = BagPanel.PageMaxCount;
        let item: ItemSlot;
        for (let i = 0; i < len; i++) {
            item = this.bagSlotList[i];
            if (!item) continue;
            item.dataChange(items[i]);
        }
    }

    private closeHandler() {
        const med: BagMediator = this.mWorld.uiManager.getMediator(BagMediator.NAME) as BagMediator;
        med.hide();
    }

    private onFocusHandler() {
        if (!this.mWorld || !this.mWorld.inputManager) {
            return;
        }
        // this.mWorld.inputManager.enable = false;
        if (!this.mInputText) return;
        this.mInputText.on("textchange", this.checkChinese, this);
        this.mInputText.setText("");
    }

    private onBlurHandler() {
        if (!this.mWorld || !this.mWorld.inputManager || !this.mInputText) {
            return;
        }
        // this.mWorld.inputManager.enable = false;
        this.mInputText.on("textchange", this.checkChinese, this);
        this.mInputText.setText(this.mBaseStr);
    }

    private checkChinese() {
        const str: string = this.mInputText.text;
        if (str.length < 1 || !Tool.checkChinese(str) || str === this.mBaseStr) {
            this.refreshDataList(this.mDataList);
            return;
        }
        const itemList: op_gameconfig.IItem[] = this.mWorld.roomManager.currentRoom.playerManager.actor.package.items;
        itemList.forEach((item: op_gameconfig.IItem) => {
            if (item) {
                if (Tool.checkItemName(item.name, this.mInputText.text)) {
                    this.mCheckList.push(item);
                }
            }
        });
        this.refreshDataList(this.mCheckList);
    }
}
