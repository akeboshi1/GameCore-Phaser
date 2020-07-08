import { WorldService } from "../../../game/world.service";
import { ItemSlot } from "../../components/item.slot";
import { Size } from "../../../utils/size";
import { Logger } from "../../../utils/log";
import { Border, Background, Url } from "../../../utils/resUtil";
import { BagMediator } from "./bagMediator";
import { InputText, NineSlicePatch } from "tooqingui";
import { Tool } from "../../../utils/tool";
import { op_gameconfig } from "pixelpai_proto";
import { IconBtn } from "../../components/icon.btn";
import { BasePanel } from "../../components/BasePanel";
import { UIMediatorType } from "../../ui.mediatorType";
export class BagPanel extends BasePanel {
    public static PageMaxCount: number = 32;
    public bagSlotList: ItemSlot[];
    public mPreBtn: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics;
    public mNextBtn: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics;
    protected mResStr: string;
    protected mResPng: string;
    protected mResJson: string;
    private mClsBtn: IconBtn | Phaser.GameObjects.Graphics;
    private mPageNum: number = 0;
    private mPageIndex: number = 1;
    private mDataList: any[];
    private mBg: NineSlicePatch | Phaser.GameObjects.Graphics;
    private mBorder: NineSlicePatch | Phaser.GameObjects.Graphics;
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
            if (!CONFIG.pure) {
                (<Phaser.GameObjects.Sprite>this.mPreBtn).play("slipBtn");
                (<Phaser.GameObjects.Sprite>this.mNextBtn).play("slipBtn");
            }
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
        const bgWid: number = 500;
        const bgHei: number = 350;
        const borderWid: number = bgWid - 10;
        const borderHei: number = bgHei - 30;
        const txtBgWid: number = borderWid / 2 - 40;
        const txtBgHei: number = 35;
        const btnWid: number = 30;
        const btnHei: number = 10;
        const titleConWid: number = 20;
        const titleConHei: number = 20;
        let txtBg: NineSlicePatch | Phaser.GameObjects.Graphics;

        let titleCon;
        if (!CONFIG.pure) {
            this.mBg = new NineSlicePatch(this.scene, 0, 0, bgWid, bgHei, Background.getName(), null, Background.getConfig());
            this.mBorder = new NineSlicePatch(this.scene, 0, 0, borderWid, borderHei, Border.getName(), null, Border.getConfig());
            txtBg = new NineSlicePatch(this.scene, 0, 0, txtBgWid, txtBgHei, Border.getName(), null, Border.getConfig());
            txtBg.x = borderWid / 4 + 5;
            txtBg.y = -bgHei / 2 + 65;
            this.mPreBtn = this.scene.make.sprite(undefined, false);
            this.mNextBtn = this.scene.make.sprite(undefined, false);
            this.mNextBtn.scaleX = -1;
            titleCon = this.scene.make.sprite(undefined, false);
            titleCon.setTexture(this.mResStr, "bagView_titleBtn.png");
            this.mClsBtn = new IconBtn(this.scene, this.mWorld, {
                key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
                iconResKey: "", iconTexture: "", scale: 1, pngUrl: this.mResPng, jsonUrl: this.mResJson
            });
        } else {
            this.mBg = this.mScene.make.graphics(undefined, false);
            this.mBg.fillStyle(0);
            this.mBg.fillRect(-bgWid >> 1, -bgHei >> 1, bgWid, bgHei);

            this.mBorder = this.mScene.make.graphics(undefined, false);
            this.mBorder.fillStyle(0xcc00ff, .8);
            this.mBorder.fillRect(-borderWid >> 1, -borderHei >> 1, borderWid, borderHei);

            txtBg = this.mScene.make.graphics(undefined, false);
            txtBg.fillStyle(0, .8);
            txtBg.fillRect(-txtBgWid >> 1, -txtBgHei >> 1, txtBgWid, txtBgHei);
            txtBg.x = borderWid / 4 + 5;
            txtBg.y = -bgHei / 2 + 65;
            this.mPreBtn = this.mScene.make.graphics(undefined, false);
            this.mNextBtn = this.mScene.make.graphics(undefined, false);
            this.mPreBtn.fillStyle(0xffff, .8);
            this.mPreBtn.fillRect(-btnWid >> 1, 0, btnWid, btnHei);

            this.mNextBtn.fillStyle(0xffff, .8);
            this.mNextBtn.fillRect(-btnWid >> 1, 0, btnWid, btnHei);
            this.mNextBtn.scaleX = 1;
            titleCon = this.mScene.make.graphics(undefined, false);
            titleCon.fillStyle(0xccff00, .8);
            titleCon.fillRect(0, 0, titleConWid, titleConHei);
            this.mClsBtn = this.mScene.make.graphics(undefined, false);
            this.mClsBtn.fillStyle(0xffcc00, .8);
            this.mClsBtn.fillRect(0, 0, 10, 10);
        }
        // this.mBg.x = size.width - this.width >> 1;
        // this.mBg.y = size.height - this.mBg.height >> 1;
        this.addAt(this.mBg, 0);
        this.setSize(bgWid, bgHei);

        this.mBorder.x = this.mBg.x;
        this.mBorder.y = this.mBg.y + 10;
        this.addAt(this.mBorder, 1);

        this.add(txtBg);

        this.mInputText = new InputText(this.scene, 0, 0, 10, 10, {
            type: "input",
            fontSize: "14px",
            color: "#808080"
        })
            .resize(txtBgWid, txtBgHei)
            .setOrigin(0, 0);
        this.mInputText.x = txtBg.x - txtBgWid / 2;
        this.mInputText.y = txtBg.y - txtBgHei / 2;
        this.mInputText.setText(this.mBaseStr);
        this.add(this.mInputText);
        // 多排背包格位
        this.bagSlotList = [];
        for (let i: number = 0; i < BagPanel.PageMaxCount; i++) {
            tmpX = i % 8 * 60 - 210;
            tmpY = Math.floor(i / 8) * 60 - borderHei / 2 + this.mBorder.y + borderHei / 2 - 55;
            if (!CONFIG.pure) {
                itemSlot = new ItemSlot(this.scene, this.mWorld, this, tmpX, tmpY, this.mResStr, this.mResPng, this.mResJson, "bagView_slot.png", "itemSelectFrame");
            } else {
                itemSlot = new ItemSlot(this.scene, this.mWorld, this, tmpX, tmpY);
            }
            itemSlot.createUI();
            this.bagSlotList.push(itemSlot);
        }
        this.mPreBtn.x = -bgWid >> 1;
        // // ===============背包界面右翻按钮
        this.mNextBtn.x = bgWid >> 1;
        // const titleCon: Phaser.GameObjects.Sprite = this.scene.make.sprite(undefined, false);
        // titleCon.setTexture(this.mResStr, "bagView_titleBtn.png");
        titleCon.x = (-bgWid >> 1) + 50;
        titleCon.y = (-bgHei >> 1);
        this.add(titleCon);
        const titleTF: Phaser.GameObjects.Text = this.scene.make.text(undefined, false);
        titleTF.setFontFamily("Tahoma");
        titleTF.setFontStyle("bold");
        titleTF.setFontSize(20);
        titleTF.setText("背包");
        titleTF.x = (-bgWid >> 1) + 72;
        titleTF.y = (-bgHei >> 1) - (titleTF.height >> 1);
        this.add(titleTF);
        this.add(this.mPreBtn);
        this.add(this.mNextBtn);
        this.mNextBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, btnWid, btnHei), Phaser.Geom.Rectangle.Contains);
        this.mPreBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, btnWid, btnHei), Phaser.Geom.Rectangle.Contains);
        this.width = bgWid;
        this.height = bgHei;

        // new IconBtn(this.scene, this.mWorld, {
        //     key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
        //     iconResKey: "", iconTexture: "", scale: 1, pngUrl: this.mResPng, jsonUrl: this.mResJson
        // });
        this.mClsBtn.x = (this.width >> 1) - 65;
        this.mClsBtn.y = -this.height >> 1;
        this.mClsBtn.scaleX = this.mClsBtn.scaleY = 2;
        this.mClsBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 10, 10), Phaser.Geom.Rectangle.Contains);
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
        if (!CONFIG.debug) {
            this.mResStr = "bagView";
            this.mResPng = "ui/bag/bagView.png";
            this.mResJson = "ui/bag/bagView.json";
            this.scene.load.atlas("itemChose", Url.getRes("ui/bag/itemChose.png"), Url.getRes("ui/bag/itemChose.json"));
            this.scene.load.atlas("slip", Url.getRes("ui/bag/slip.png"), Url.getRes("ui/bag/slip.json"));
            this.scene.load.image(Border.getName(), Border.getPNG());
            this.scene.load.image(Background.getName(), Background.getPNG());
            this.scene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
            this.scene.load.atlas(this.mResStr, Url.getRes(this.mResPng), Url.getRes(this.mResJson));
        }
        super.preload();
    }

    protected loadComplete(loader: Phaser.Loader.LoaderPlugin, totalComplete: integer, totalFailed: integer) {
        if (!CONFIG.pure) {
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
        }
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

    private preNextBtnScaleHandler(gameObject: any, scaleX: number = 1) {
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
