import { NineSlicePatch, Button, ClickEvent, NineSliceButton, GameScroller } from "apowophaserui";
import { Coin, Handler, i18n, UIHelper } from "utils";
import { ButtonEventDispatcher } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ImageValue, ItemButton } from "../Components";
import { ICountablePackageItem, IPrice } from "picaStructure";

export class PicaUltimateRewardPanel extends ButtonEventDispatcher {
    protected mBackGround: Phaser.GameObjects.Graphics;
    protected content: Phaser.GameObjects.Container;
    protected bg: NineSlicePatch;
    protected titleText: Phaser.GameObjects.Text;
    private titlebg: Phaser.GameObjects.Image;
    private closeBtn: Button;
    private labelTips: Phaser.GameObjects.Text;
    private gameScroll: GameScroller;
    private cancelBtn: NineSliceButton;
    private confirmBtn: NineSliceButton;
    private sendHandler: Handler;
    private rewardItems: ItemButton[] = [];
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, dpr, zoom, false);
        this.setSize(width, height);
        this.init();
    }
    resize(width: number, height: number) {
        const w: number = width;
        const h: number = height;
        super.resize(width, height);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.66);
        this.mBackGround.fillRect(-w * 0.5, -h * 0.5, w, h);
        this.content.x = 0;
        this.content.y = 0;
        this.enable = true;
    }
    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }
    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setUltimateRewards(datas: ICountablePackageItem[], maxLevel: number) {
        this.labelTips.text = i18n.t("battlepass.ultimatetips", { name: maxLevel });
        for (let i = 0; i < datas.length; i++) {
            let item: ItemButton;
            if (i < this.rewardItems.length) {
                item = this.rewardItems[i];
            } else {
                item = new ItemButton(this.scene, undefined, undefined, this.dpr, this.zoom, false);
                this.rewardItems.push(item);
                this.gameScroll.addItem(item);
            }
            item.setItemData(datas[i]);
        }
        if (datas.length >= 4) this.gameScroll.setAlign(2);
        else this.gameScroll.setAlign(1);
        this.gameScroll.Sort();
        this.gameScroll.refreshMask();
    }

    protected init() {
        const width = this.width;
        const height = this.height;
        this.mBackGround = this.scene.make.graphics(undefined, false);
        this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.mBackGround.on("pointerup", this.onCloseHandler, this);
        const conWidth = 312 * this.dpr, conHeight = 240 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWidth, conHeight);
        this.add([this.mBackGround, this.content]);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWidth, conHeight, UIAtlasName.uicommon1, "bg_universal_box", {
            left: 70 * this.dpr,
            top: 30 * this.dpr,
            right: 30 * this.dpr,
            bottom: 70 * this.dpr
        });
        this.bg.setInteractive();
        const posY = -conHeight * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon1, frame: "title" });
        this.titlebg.y = posY + 5 * this.dpr;
        this.titleText = this.scene.make.text({ x: 0, y: this.titlebg.y + 2 * this.dpr, text: i18n.t("battlepass.ultimatetitle"), style: UIHelper.colorStyle("#905C06", 18 * this.dpr) }).setOrigin(0.5);
        this.titleText.setFontStyle("bold");
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "close");
        this.closeBtn.setPosition(conWidth * 0.5 - 7 * this.dpr, posY + this.dpr * 7);
        this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.labelTips = this.scene.make.text({ text: i18n.t("market.converttips"), style: UIHelper.blackStyle(this.dpr, 16) }).setOrigin(0.5);
        this.labelTips.y = -conHeight * 0.5 + 55 * this.dpr;
        this.gameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: conWidth - 28 * this.dpr,
            height: 70 * this.dpr,
            zoom: this.zoom,
            align: 1,
            orientation: 1,
            dpr: this.dpr,
            space: 6 * this.dpr,
            selfevent: true,
            cellupCallBack: (gameobject) => {
                this.onGameScrollHandler(gameobject);
            }
        });
        const bottomOffsetY = conHeight * 0.5 - 45 * this.dpr;
        const bottomOffsetX = -66 * this.dpr;
        this.cancelBtn = new NineSliceButton(this.scene, bottomOffsetX, bottomOffsetY, 107 * this.dpr, 40 * this.dpr, UIAtlasName.uicommon, "red_btn", i18n.t("common.cancel"), this.dpr, this.scale, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        this.cancelBtn.setTextStyle(UIHelper.whiteStyle(this.dpr, 16));
        this.cancelBtn.setFontStyle("bold");
        this.cancelBtn.on(ClickEvent.Tap, this.onCancelBtnHandler, this);
        this.cancelBtn.visible = false;
        this.confirmBtn = new NineSliceButton(this.scene, 0, bottomOffsetY, 107 * this.dpr, 36 * this.dpr, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.confirm"), this.dpr, this.scale, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });

        this.confirmBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 16));
        this.confirmBtn.setFontStyle("bold");
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnHandler, this);
        this.content.add([this.bg, this.titlebg, this.titleText, this.closeBtn, this.labelTips, this.gameScroll, this.cancelBtn, this.confirmBtn]);
        this.resize(width, height);
    }
    private onGameScrollHandler(obj: ItemButton) {
        obj.showTips();
    }
    private onCancelBtnHandler() {
        this.onCloseHandler();
    }

    private onConfirmBtnHandler() {
        this.onCloseHandler();
    }

    private onCloseHandler() {
        this.hide();
    }
}
