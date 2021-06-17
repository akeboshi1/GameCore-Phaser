import { NineSlicePatch, Button, ClickEvent, NineSliceButton, GameSlider } from "apowophaserui";
import { Font, Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";

export class PicaPrestigeConvertPanel extends PicaBasePanel {
    public prestigeCount: number = 1;
    protected mBackGround: Phaser.GameObjects.Graphics;
    protected content: Phaser.GameObjects.Container;
    protected bg: NineSlicePatch;
    protected titleText: Phaser.GameObjects.Text;
    private titlebg: Phaser.GameObjects.Image;
    private closeBtn: Button;
    private labelTips: Phaser.GameObjects.Text;
    private cancelBtn: NineSliceButton;
    private confirmBtn: NineSliceButton;
    private slider: GameSlider;
    private thumb: Phaser.GameObjects.Image;
    private prestigeText: Phaser.GameObjects.Text;
    private mCoinIcon: Phaser.GameObjects.Image;
    private itemCountText: Phaser.GameObjects.Text;
    private line: boolean = false;
    private radio: number = 1;
    private limitMax: number = 0;
    private powerValue: number = 0;
    private exchangeValue: number = 0;
    private residueValue: number = 0;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAPRESTIGECONVERT_NAME;
        this.loadAtlas = [UIAtlasName.market, UIAtlasName.uicommon, UIAtlasName.uicommon1];
    }
    resize(width: number, height: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(width, height);
        this.setSize(w, h);
        this.mBackGround.clear();
        this.mBackGround.fillStyle(0x000000, 0.66);
        this.mBackGround.fillRect(0, 0, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
    }

    public setExchangedEnergy(enery: number, riado: number, max: number) {
        this.powerValue = enery;
        this.radio = riado;
        this.limitMax = max;
        this.slider.setValue(1);
    }
    public setExchangedPopularityCoin(exchange: number) {
        this.exchangeValue = exchange;
        if (!this.mInitialized) return;
        this.updateData();
    }
    protected init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
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
        this.titleText = this.scene.make.text({ x: 0, y: this.titlebg.y + 2 * this.dpr, text: i18n.t("market.prestigetitle"), style: UIHelper.colorStyle("#905C06", 18 * this.dpr) }).setOrigin(0.5);
        this.titleText.setFontStyle("bold");
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "close");
        this.closeBtn.setPosition(conWidth * 0.5 - 7 * this.dpr, posY + this.dpr * 7);
        this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
        this.labelTips = this.scene.make.text({ text: i18n.t("market.converttips"), style: UIHelper.blackStyle(this.dpr, 16) }).setOrigin(0.5);
        this.labelTips.y = -conHeight * 0.5 + 55 * this.dpr;
        const sliderbg = this.scene.make.image({ key: UIAtlasName.market, frame: "prestige_schedule_bottom" });
        const indicator = this.scene.make.image({ key: UIAtlasName.market, frame: "prestige_schedule_top" });
        const thumb = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "block" });
        this.thumb = thumb;
        this.itemCountText = this.scene.make.text({
            x: 0, y: 0,
            style: {
                color: "#744803",
                fontSize: 15 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        this.slider = new GameSlider(this.scene, {
            x: 0, y: this.labelTips.y + 35 * this.dpr, width: 250 * this.dpr, height: 4 * this.dpr, orientation: 1,
            background: sliderbg,
            indicator,
            thumb,
            offsetX: thumb.width * 0.5,
            valuechangeCallback: this.onSliderValueHandler,
            valuechangeCallbackScope: this,
            value: 0.5
        });

        this.slider.add(this.itemCountText);
        const acquireTips = this.scene.make.text({ text: i18n.t("common.acquire"), style: UIHelper.blackStyle(this.dpr, 14) }).setFontStyle("bold").setOrigin(0, 0.5);
        acquireTips.x = -43 * this.dpr;
        acquireTips.y = this.slider.y + 30 * this.dpr;
        this.mCoinIcon = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "iv_prestige" }, false).setOrigin(0.5);
        this.mCoinIcon.x = acquireTips.x + acquireTips.width + this.mCoinIcon.width * 0.5 + 5 * this.dpr;
        this.mCoinIcon.y = acquireTips.y;
        this.prestigeText = this.scene.make.text({ style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0, 0.5).setFontStyle("bold");
        this.prestigeText.x = this.mCoinIcon.x + this.mCoinIcon.width * 0.5 + 5 * this.dpr;
        this.prestigeText.y = this.mCoinIcon.y;
        const convertvaluetips = this.scene.make.text({ text: i18n.t("market.convertvaluetips"), style: UIHelper.colorStyle("#111111", 12 * this.dpr) }).setAlpha(0.6).setOrigin(0.5);
        convertvaluetips.y = acquireTips.y + 30 * this.dpr;
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
        this.confirmBtn = new NineSliceButton(this.scene, -bottomOffsetX, bottomOffsetY, 107 * this.dpr, 36 * this.dpr, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.confirm"), this.dpr, this.scale, {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });

        this.confirmBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 16));
        this.confirmBtn.setFontStyle("bold");
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnHandler, this);
        this.content.add([this.bg, this.titlebg, this.titleText, this.closeBtn, this.labelTips, this.slider, acquireTips, this.mCoinIcon, this.prestigeText, convertvaluetips, this.cancelBtn, this.confirmBtn]);
        this.resize(0, 0);
        super.init();
        this.slider.setValue(0);
    }
    private onSliderValueHandler(value: number) {
        this.itemCountText.x = this.thumb.x;
        this.prestigeCount = this.lineSliderValue(value);
        this.updateData();
    }
    private updateData() {
        this.residueValue = this.limitMax - this.exchangeValue;
        if (this.prestigeCount > this.residueValue) this.prestigeCount = this.residueValue;
        if (this.prestigeCount === 0 && this.powerValue >= this.radio) {
            this.prestigeCount = 1;
        }
        if (this.itemCountText) this.itemCountText.text = this.prestigeCount + "";
        if (this.prestigeText) this.prestigeText.text = this.prestigeCount + "";
    }
    private onCancelBtnHandler() {
        this.onCloseHandler();
    }

    private onConfirmBtnHandler() {
        let text = "";
        if (this.prestigeCount > 0) {
            this.render.renderEmitter(this.key + "_convert", this.prestigeCount);
            text = i18n.t("market.convertsuccess");
        } else {
            if (this.powerValue < this.radio) {
                text = i18n.t("market.powertips");
            } else {
                text = i18n.t("market.counttisp");
            }
        }
        const noticedata = {
            text: [{ text, node: undefined }]
        };
        this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, noticedata);
        this.onCloseHandler();
    }
    private calcuSliderValue(value) {
        const allcount = this.powerValue;
        let count = 0;
        const line = 10;
        const num = 4;
        if (allcount <= line * num) {
            count = Math.round(allcount * value);
        } else {
            if (value <= 1 / num) {
                count = line * num * value;
            } else {
                const mcount = allcount - line;
                if (mcount <= line * num) {
                    count = line + mcount * (value - 1 / num) / (1 - 1 / num);
                } else {
                    const ncount = mcount / num;
                    count = line;
                    for (let i = 1; i < num; i++) {
                        const fcount = ncount + mcount / (num * (num - 1)) * (i - 1);
                        if (value > i / num && value <= (i + 1) / num) {
                            count += fcount * (value - i / num) / (1 / num);
                            break;
                        } else {
                            count += fcount;
                        }
                    }
                }
            }
        }
        count = Math.round(count * this.radio);
        if (count < 1) count = 1;
        return count;
    }

    private lineSliderValue(value) {
        const allcount = this.powerValue;
        const count = Math.floor(allcount * value * this.radio);
        return count;
    }
    private onCloseHandler() {
        this.render.renderEmitter(this.key + "_hide");
    }
}
