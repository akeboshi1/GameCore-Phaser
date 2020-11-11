import { DetailDisplay } from "../Market/DetailDisplay";
import { NineSliceButton, GameSlider, NineSlicePatch, ClickEvent } from "apowophaserui";
import { BasePanel, UiManager } from "gamecoreRender";
import { ModuleName, RENDER_PEER } from "structure";
import { Coin, Font, i18n } from "utils";
import { UIAtlasKey, UIAtlasName } from "picaRes";
export class PicaPropFunPanel extends BasePanel {
    public itemCount: number = 1;
    private itemName: Phaser.GameObjects.Text;
    private titleName: Phaser.GameObjects.Text;
    private mDetailDisplay: DetailDisplay;
    private pricText: Phaser.GameObjects.Text;
    private priceBg: Phaser.GameObjects.Image;
    private mCoinIcon: Phaser.GameObjects.Image;
    private itemCountText: Phaser.GameObjects.Text;
    private itemData: any;// op_client.ICountablePackageItem
    private confirmHandler: Function;
    private confirmHandlerAddData: any;
    private cancelHandler: Function;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private content: Phaser.GameObjects.Container;
    private cancelBtn: NineSliceButton;
    private confirmBtn: NineSliceButton;
    private slider: GameSlider;
    private thumb: Phaser.GameObjects.Image;
    private line: boolean = false;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAPROPFUN_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        super.resize(width, height);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 0.66);
        this.blackGraphic.fillRect(0, 0, width, height);
        this.content.x = width / 2;
        this.content.y = height / 2;
        this.setSize(width * this.scale, height * this.scale);
    }

    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.setInteractive();
        this.addListen();
        const config = this.mShowData;// PicPropFunConfig
        this.setProp(config);
        this.updateData();
    }

    addListen() {
        if (!this.mInitialized) return;
        this.cancelBtn.on(ClickEvent.Tap, this.onCancelBtnHandler, this);
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnHandler, this);

    }

    removeListen() {
        if (!this.mInitialized) return;
        this.cancelBtn.off(ClickEvent.Tap, this.onCancelBtnHandler, this);
        this.confirmBtn.off(ClickEvent.Tap, this.onConfirmBtnHandler, this);
    }

    preload() {
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        const dpr = this.dpr;
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.blackGraphic.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 299 * this.dpr, bgheight = 305 * this.dpr;
        this.content.setSize(bgwidth, bgheight);
        this.add(this.content);
        const bg = new NineSlicePatch(this.scene, 0, 0, bgwidth, bgheight, UIAtlasKey.common2Key, "bg", {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 30 * this.dpr,
            bottom: 40 * this.dpr
        });
        bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        const posY = -bg.height * 0.5 + 3 * dpr;
        const titlebg = this.scene.make.image({ x: 0, y: posY, key: UIAtlasKey.common2Key, frame: "title" });
        titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titleName = this.scene.make.text({
            x: 0, y: posY + 3 * dpr, text: "售出",
            style: {
                color: "#905B06",
                fontSize: 16 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        this.titleName.setFontStyle("bold");
        this.itemName = this.scene.make.text({
            x: 0, y: posY + 40 * dpr,
            style: {
                color: "#000000",
                fontSize: 15 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        const iconOffset: number = -40 * dpr;
        this.mDetailDisplay = new DetailDisplay(this.scene, this.render);
        this.mDetailDisplay.scale = this.dpr * 0.8;
        this.mDetailDisplay.y = iconOffset;
        // this.mDetailDisplay.setSize(110 * this.dpr, 110 * this.dpr);
        const priceOffset: number = 30 * dpr;
        this.priceBg = this.scene.make.image({ x: 0, y: priceOffset, key: UIAtlasKey.common2Key, frame: "price_bg" });
        this.priceBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.pricText = this.scene.make.text({
            x: 0, y: priceOffset,
            style: {
                color: "#000000",
                fontSize: 15 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        this.mCoinIcon = this.scene.make.image({ x: -45 * this.dpr, y: priceOffset, key: UIAtlasKey.commonKey, frame: "iv_coin" }, false).setOrigin(0.5);
        this.mCoinIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        const sliderbg = new NineSlicePatch(this.scene, 0, 0, 8, 7 * dpr, UIAtlasKey.common2Key, "slider_bg", {
            left: 3,
            top: 1,
            right: 3,
            bottom: 1
        });
        const indicator = new NineSlicePatch(this.scene, 0, 0, 8, 7 * dpr, UIAtlasKey.common2Key, "slider_rate", {
            left: 3,
            top: 1,
            right: 3,
            bottom: 1
        });
        const thumb = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "block" });
        this.thumb = thumb;
        this.itemCountText = this.scene.make.text({
            x: 0, y: 0,
            style: {
                color: "#744803",
                fontSize: 15 * dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setOrigin(0.5);
        this.slider = new GameSlider(this.scene, {
            x: 0, y: 70 * dpr, width: 136 * dpr, height: 7 * dpr, orientation: 1,
            background: sliderbg,
            indicator,
            thumb,
            offsetX: thumb.width * 0.5,
            valuechangeCallback: this.onSliderValueHandler,
            valuechangeCallbackScope: this,
            value: 0.5
        });

        this.slider.add(this.itemCountText);
        this.slider.setValue(0);
        const bottomOffsetY = bg.height * 0.5 - 30 * dpr;
        const bottomOffsetX = -66 * dpr;
        this.cancelBtn = new NineSliceButton(this.scene, bottomOffsetX, bottomOffsetY, 112 * dpr, 36 * dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("common.cancel"), dpr, this.scale, {
            left: 12 * dpr,
            top: 12 * dpr,
            right: 12 * dpr,
            bottom: 12 * dpr
        });
        this.confirmBtn = new NineSliceButton(this.scene, -bottomOffsetX, bottomOffsetY, 112 * dpr, 36 * dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("common.confirm"), dpr, this.scale, {
            left: 12 * dpr,
            top: 12 * dpr,
            right: 12 * dpr,
            bottom: 12 * dpr
        });
        this.cancelBtn.setTextStyle({ color: "#FFFFFF", fontSize: 16 * dpr, fontFamily: Font.DEFULT_FONT });
        this.confirmBtn.setTextStyle({ color: "#976400", fontSize: 16 * dpr, fontFamily: Font.DEFULT_FONT });
        this.content.add([bg, titlebg, this.titleName, this.itemName, this.mDetailDisplay, this.priceBg, this.mCoinIcon, this.pricText, this.slider, this.cancelBtn, this.confirmBtn]);
        this.resize(0, 0);
        super.init();
    }

    destroy() {
        super.destroy();
    }

    public setProp(config: any) {// PicPropFunConfig
        const prop = config.data;
        let price = (config.price !== undefined ? config.price : true);
        price = prop.sellingPrice ? price : false;
        const slider = (config.slider !== undefined ? config.slider : true);
        this.line = config.line || false;
        this.itemData = prop;
        if (slider)
            this.itemCount = 1;
        else this.itemCount = prop.count;
        if (config.resource)
            this.setResource(config.resource);
        if (config.url)
            this.mDetailDisplay.loadUrl(config.url);
        this.itemName.text = prop.name || prop.shortName;
        this.itemCountText.text = this.itemCount + "";
        if (config.title) {
            this.titleName.text = config.title;
        }
        if (price) {
            this.pricText.visible = true;
            this.priceBg.visible = true;
            this.mCoinIcon.visible = true;
            this.slider.y = 70 * this.dpr;
            this.pricText.text = `${Coin.getName(prop.sellingPrice.coinType)} x ${prop.sellingPrice.price * this.itemCount}`;
            const coinIcon = Coin.getIcon(prop.sellingPrice.coinType);
            this.mCoinIcon.setFrame(coinIcon);
        } else {
            this.pricText.visible = false;
            this.priceBg.visible = false;
            this.mCoinIcon.visible = false;
            this.slider.y = 50 * this.dpr;
        }
        if (config.resultHandler.key && config.resultHandler.key.length > 0) {
            const panel = this.uiManager.getPanel(`${config.resultHandler.key}Panel`);
            if (panel) {
                if (config.resultHandler.confirmFunc && config.resultHandler.confirmFunc in panel && typeof panel[config.resultHandler.confirmFunc] === "function") {
                    this.confirmHandler = panel[config.resultHandler.confirmFunc];
                }
                if (config.resultHandler.confirmAddData) {
                    this.confirmHandlerAddData = config.resultHandler.confirmAddData;
                }
                if (config.resultHandler.cancelFunc && config.resultHandler.cancelFunc in panel && typeof panel[config.resultHandler.cancelFunc] === "function") {
                    this.cancelHandler = panel[config.resultHandler.cancelFunc];
                }
            }
        }
        this.slider.visible = slider;
        this.slider.setValue(0);
    }
    setResource(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
        if (content) {
            if (content.display) {
                this.mDetailDisplay.loadDisplay(content);
            } else if (content.avatar) {
                this.mDetailDisplay.loadAvatar(content, 2, new Phaser.Geom.Point(0, 35 * 2));
            }
        } else {
            this.mDetailDisplay.loadUrl(this.itemData.display.texturePath);
        }
    }
    private updateData() {
        if (this.itemCountText)
            this.itemCountText.text = this.itemCount + "";
        if (this.pricText && this.itemData && this.itemData.sellingPrice)
            this.pricText.text = `${Coin.getName(this.itemData.sellingPrice.coinType)} x ${this.itemData.sellingPrice.price * this.itemCount}`;
    }

    private onCancelBtnHandler() {
        if (this.cancelHandler) {
            this.cancelHandler(this.itemData);
        }
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_close");
    }

    private onConfirmBtnHandler() {
        if (this.confirmHandler) {
            if (this.confirmHandlerAddData) {
                this.confirmHandler(this.confirmHandlerAddData, this.itemData, this.itemCount);
            } else {
                this.confirmHandler(this.itemData, this.itemCount);
            }
        }
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_close");
    }

    private onSliderValueHandler(value: number) {
        this.itemCountText.x = this.thumb.x;
        this.itemCount = this.line ? this.calcuSliderValue(value) : this.lineSliderValue(value);
        this.updateData();
    }

    private calcuSliderValue(value) {
        const allcount = this.itemData ? this.itemData.count : 1;
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
        count = Math.round(count);
        if (count < 1) count = 1;
        return count;
    }

    private lineSliderValue(value) {
        const allcount = this.itemData ? this.itemData.count : 1;
        const count = Math.round(allcount * value);
        return count;
    }
}
