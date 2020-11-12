import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, ClickEvent, GameScroller, TabButton } from "apowophaserui";
import { BasePanel, CheckboxGroup, DynamicImage, GridLayoutGroup, ItemInfoTips, PropItem, SoundButton, ThreeSliceButton, UiManager, ValueContainer, AxisType, ConstraintType, AlignmentType } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";
export class PicaRechargePanel extends BasePanel {
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private topbg: Phaser.GameObjects.Image;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Button;
    private diamondvalue: ValueContainer;
    private gridlayout: GridLayoutGroup;
    private content: Phaser.GameObjects.Container;
    private middle: Phaser.GameObjects.Container;
    private top: Phaser.GameObjects.Container;
    private gamescroll: GameScroller;
    private bottombg: Phaser.GameObjects.Image;
    private bottom: Phaser.GameObjects.Container;
    private checkBox: CheckboxGroup;
    private itemtips: ItemInfoTips;
    private banner: RechargeBanner;
    constructor(uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICARECHARGE_NAME;
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.mBackground.clear();
        this.mBackground.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
        this.mBackground.fillRect(0, 0, w, h);
        this.content.setSize(w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.top.y = -h * 0.5 + this.top.height * 0.5;

        this.bottom.y = h * 0.5 - this.bottom.height * 0.5;
        const defaultHeight = 640 * this.dpr;
        if (height < defaultHeight) {
            this.middle.y = this.top.y + this.top.height + this.middle.height * 0.5;
        } else {
            this.middle.y = 28 * this.dpr;
        }
        const fixedHeight = this.top.height + this.bottom.height;
        this.bg.scaleY = 1;
        this.bg.displayHeight = h - fixedHeight + 60 * this.dpr;
        if (this.gamescroll) {
            this.gamescroll.refreshMask();
        }
    }

    public show(param?: any) {
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
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "recharge/recharge.png", "recharge/recharge.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.textureUrl(UIAtlasName.commonUrl), UIAtlasName.jsonUrl(UIAtlasName.commonUrl));
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.textureUrl(UIAtlasName.common2Url), UIAtlasName.jsonUrl(UIAtlasName.common2Url));
        this.addAtlas(UIAtlasKey.common3Key, UIAtlasName.textureUrl(UIAtlasName.common3Url), UIAtlasName.jsonUrl(UIAtlasName.common3Url));
        super.preload();
    }
    init() {
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.add(this.mBackground);
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(width, height);
        this.add(this.content);
        this.bg = this.scene.make.image({ key: this.key, frame: "recharge_bg" });
        this.bg.scale = 1;
        this.bg.displayHeight = height - (96 * this.dpr + 50 * this.dpr);
        this.bg.y = 23 * this.dpr;
        this.content.add(this.bg);

        this.top = this.scene.make.container(undefined, false);
        this.top.setSize(width, 100 * this.dpr);
        this.top.y = -height * 0.5 + this.top.height * 0.5;
        this.content.add(this.top);
        const posY = -this.top.height * 0.5;
        this.topbg = this.scene.make.image({ key: this.key, frame: "recharge_head" });
        this.topbg.y = posY + this.topbg.height * 0.5 + 43 * this.dpr;
        this.titlebg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "recharge_text" });
        this.titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titlebg.y = posY + 45 * this.dpr;
        this.tilteName = this.scene.make.text({ x: 0, y: this.titlebg.y + 2 * this.dpr, text: i18n.t("recharge.title"), style: UIHelper.titleYellowStyle_m(this.dpr) }).setOrigin(0.5);
        this.tilteName.setFontStyle("bold");
        this.tilteName.setResolution(this.dpr);
        this.closeBtn = new Button(this.scene, UIAtlasKey.commonKey, "back_arrow", "back_arrow");
        this.closeBtn.x = -width * 0.5 + this.closeBtn.width * 0.5 + this.dpr * 15;
        this.closeBtn.y = posY + this.closeBtn.height * 0.5 + 10 * this.dpr;
        this.diamondvalue = new ValueContainer(this.scene, UIAtlasKey.common3Key, "diamond", this.dpr);
        this.diamondvalue.x = width * 0.5 - 46 * this.dpr;
        this.diamondvalue.y = this.closeBtn.y;
        this.top.add([this.topbg, this.titlebg, this.tilteName, this.closeBtn, this.diamondvalue]);
        this.createMiddle(width, height);
        this.createBottom(width, 50 * this.dpr);
        this.itemtips = new ItemInfoTips(this.scene, 150 * this.dpr, 46 * this.dpr, UIAtlasKey.common2Key, "tips_bg", this.dpr);
        this.itemtips.setVisible(false);
        this.content.add(this.itemtips);
        this.resize();
        super.init();
        // this.emit("questlist");
        this.setDataList();
    }
    public setDataList() {
        if (this.gamescroll) {
            for (let i = 0; i < 3; i++) {
                const item = new TwoRechargeItem(this.scene, this.width, 110 * this.dpr, this.key, this.dpr, this.scale);
                item.setHandler(new Handler(this, (value) => {
                    this.buy("com.tooqing.app.60diamond", "测试付费项目");
                }));
                item.setTwoData();
                this.gamescroll.addItem(item);
            }
            this.gamescroll.Sort();
        } else {
            for (let i = 0; i < 6; i++) {
                const item = new RechargeItem(this.scene, this.key, this.dpr, this.scale);
                item.setHandler(new Handler(this, (value) => {
                    this.buy("com.tooqing.app.60diamond", "测试付费项目");
                }));
                this.gridlayout.add(item);
            }
            this.gridlayout.Layout();
        }
    }

    destroy() {
        super.destroy();
    }

    protected createMiddle(width: number, height: number) {
        this.middle = this.scene.make.container(undefined, false);
        this.content.add(this.middle);
        this.banner = new RechargeBanner(this.scene, 0, 0, 308 * this.dpr, 96 * this.dpr, this.key, "recharge_banner", this.scale);
        this.middle.add(this.banner);
        const fixedHeight = 150 * this.dpr;
        const mHeight = height - fixedHeight;
        const defaultHeight = 640 * this.dpr - fixedHeight;
        if (mHeight < defaultHeight) {
            this.middle.setSize(width, mHeight);
            this.middle.y = this.top.y + this.top.height + this.middle.height * 0.5;
            this.banner.y = -this.middle.height * 0.5 + this.banner.height * 0.5;
            const topline = this.scene.make.image({ key: this.key, frame: "recharge_division" });
            topline.y = this.banner.y + this.banner.height * 0.5 + topline.height * 0.5;
            this.middle.add(topline);
            const scrollHeight = mHeight - 110 * this.dpr;
            const scrolly = scrollHeight * 0.5 + topline.y + topline.height * 0.5;
            this.gamescroll = this.createGameScroll(0, scrolly, width, scrollHeight);
            this.middle.add(this.gamescroll);
        } else {
            this.middle.setSize(width, 500 * this.dpr);
            this.middle.y = 28 * this.dpr;
            this.banner.y = -this.middle.height * 0.5 + this.banner.height * 0.5 + 3 * this.dpr;
            let lineposy = this.banner.y + this.banner.height * 0.5 - this.dpr;
            for (let i = 0; i < 4; i++) {
                const topline = this.scene.make.image({ key: this.key, frame: "recharge_division" });
                topline.y = lineposy + topline.height * 0.5;
                lineposy += 131 * this.dpr;
                this.middle.add(topline);
            }
            this.gridlayout = new GridLayoutGroup(this.scene, 0, 0, {
                cellSize: new Phaser.Math.Vector2(149 * this.dpr, 110 * this.dpr),
                space: new Phaser.Math.Vector2(10 * this.dpr, 21 * this.dpr),
                startAxis: AxisType.Horizontal,
                constraint: ConstraintType.FixedColumnCount,
                constraintCount: 2,
                alignmentType: AlignmentType.UpperCenter
            });
            this.gridlayout.y = this.banner.y + this.banner.height * 0.5 + 21 * this.dpr;
            this.middle.add(this.gridlayout);
        }
    }

    protected createBottom(width: number, height: number) {
        this.bottom = this.scene.make.container(undefined, false);
        this.bottom.setSize(width, height);
        this.content.add(this.bottom);
        this.bottom.y = this.scaleHeight * 0.5 - height * 0.5;
        const bottombg = this.scene.make.image({ key: this.key, frame: "recharge_nav_bg" });
        this.bottom.add(bottombg);
        const tabCapW = 102 * this.dpr;
        const tabCapH = 41 * this.dpr;
        const offsetx = 15 * this.dpr;
        const topStyle = UIHelper.blueStyle(this.dpr, 15);
        this.checkBox = new CheckboxGroup();
        const topCategorys = [TabButtonType.GIFT, TabButtonType.PRIVILEGE, TabButtonType.DIAMONO];
        const topBtnTexts = [i18n.t("recharge.gift"), i18n.t("recharge.privilege"), i18n.t("recharge.diamond")];
        let bottomPosX = -(tabCapW * topCategorys.length + offsetx * (topCategorys.length - 1)) * 0.5;
        for (let i = 0; i < topCategorys.length; i++) {
            const category = topCategorys[i];
            const button = new TabButton(this.scene, this.key, "recharge_tab_uncheck", "recharge_tab_check", topBtnTexts[i]);
            button.setTextStyle(topStyle);
            button.setData("data", category);
            button.setSize(tabCapW, tabCapH);
            button.setFontStyle("bold");
            button.y = 1 * this.dpr;
            button.x = bottomPosX + tabCapW * 0.5;
            bottomPosX += tabCapW + offsetx;
            this.checkBox.appendItem(button);
            this.bottom.add(button);
        }
        this.checkBox.on("selected", this.onTabButtonHandler, this);
        this.checkBox.selectIndex(0);
    }

    private createGameScroll(x: number, y: number, width: number, height: number) {
        const gamescroll = new GameScroller(this.scene, {
            x,
            y,
            width,
            height,
            zoom: this.scale,
            align: 2,
            orientation: 0,
            dpr: this.dpr,
            space: 20 * this.dpr,
            selfEvent: true,
            padding: { top: 10 * this.dpr, bottom: 10 * this.dpr }
        });
        return gamescroll;
    }

    private buy(productId, productName) {
        if ((window as any).IAP) {
            (window as any).IAP.buy(productId, () => {
                alert(`购买${productName}成功，等待发货！`);
            });
        }
    }

    private onTabButtonHandler(button: TabButton) {

    }
    private OnClosePanel() {
        this.render.renderEmitter(ModuleName.PICARECHARGE_NAME + "_hide");
    }

    private onPointerUpHandler(gameobject: RechargeItem) {

    }
    private onSendHandler(id: string) {
        this.render.renderEmitter(ModuleName.PICARECHARGE_NAME + "_questwork", id);
    }

    private onItemInfoTips(data: op_client.ICountablePackageItem, isdown: boolean, pos: Phaser.Geom.Point) {
        this.itemtips.visible = isdown;
        this.itemtips.x = pos.x * this.scale - this.content.x;
        this.itemtips.y = pos.y * this.scale - this.content.y - 30 * this.dpr;
        this.itemtips.setText(this.getDesText(data));
    }
    private getDesText(data: op_client.ICountablePackageItem) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        const text: string = i18n.t("work.attri", { "name": `${data.name}`, "value": data.neededCount });
        return text;
    }
}

class RechargeItem extends Phaser.GameObjects.Container {
    private rechargeData: any;
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private imgicon: Phaser.GameObjects.Image;
    private title: BBCodeText;
    private tipsbg: Phaser.GameObjects.Image;
    private tipsvalue: Phaser.GameObjects.Text;
    private tipstext: Phaser.GameObjects.Text;
    private purchaseBtn: ThreeSliceButton;
    private addimg: Phaser.GameObjects.Image;
    private sendHandler: Handler;
    private giftbags: PropItem[] = [];
    private zoom: number;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        const width = 149 * dpr, height = 108 * dpr;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key, frame: "recharge_diamond_bg" });
        this.add(this.bg);
        this.title = new BBCodeText(this.scene, 0, 0, "", { color: "#ffffff", fontSize: 14 * dpr, fontFamily: Font.DEFULT_FONT })
            .setOrigin(0.5);
        this.title.x = 0;
        this.title.y = -height * 0.5 + 10 * dpr;
        this.add(this.title);
        this.imgicon = this.scene.make.image({ key, frame: "recharge_diamond_1.99" });
        this.add(this.imgicon);
        this.imgicon.x = -this.width * 0.5 + 48 * dpr;
        this.imgicon.y = 2 * dpr;
        this.tipsbg = this.scene.make.image({ key, frame: "recharge_first_purchase" });
        this.add(this.tipsbg);
        this.tipsbg.x = this.width * 0.5 - this.tipsbg.width * 0.5 + 3 * dpr;
        this.tipsbg.y = -this.height * 0.5 + this.tipsbg.height * 0.5 + 23 * dpr;
        this.tipsvalue = this.scene.make.text({ text: "", style: UIHelper.whiteStyle(dpr) });
        this.tipsvalue.setOrigin(0, 0.5);
        this.add(this.tipsvalue);
        this.tipsvalue.x = -this.width * 0.5 + 3 * dpr;
        this.tipsvalue.y = this.tipsbg.y - 7 * dpr;
        this.tipstext = this.scene.make.text({ text: "First Purchase", style: UIHelper.whiteStyle(dpr, 11) });
        this.tipstext.setOrigin(1, 0.5);
        this.add(this.tipstext);
        // this.tipstext.x = this.tipsvalue.x - 2 * dpr;
        // this.tipstext.y = this.tipsvalue.y + 24 * dpr;
        this.tipstext.x = this.width * 0.5 - 3 * dpr;
        this.tipstext.y = this.tipsbg.y - 3 * dpr;
        this.purchaseBtn = new ThreeSliceButton(scene, 63 * dpr, 22 * dpr, UIAtlasKey.common3Key, UIHelper.threeYellowNormal, UIHelper.threeYellowNormal, "$ 1.99");
        this.purchaseBtn.setTextStyle(UIHelper.brownishStyle(dpr));
        this.purchaseBtn.setFontStyle("bold");
        this.add(this.purchaseBtn);
        this.purchaseBtn.x = this.width * 0.5 - this.purchaseBtn.width * 0.5 - 10 * dpr;
        this.purchaseBtn.y = this.height * 0.5 - this.purchaseBtn.height * 0.5 - 9 * dpr;
        this.purchaseBtn.on(String(ClickEvent.Tap), this.onSendHandler, this);
        this.setRechargeData(undefined);
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }
    public setRechargeData(data: any) {
        this.rechargeData = data;
        this.title.text = `[color=#FFE400]${100}[/color]${"Diamond"}`;
        this.setPropItems();
    }

    protected setPropItems() {
        for (const item of this.giftbags) {
            item.visible = false;
            item.enable = false;
        }
        const matrr = [];
        let posx = 0;
        if (matrr.length === 1) {
            if (this.addimg) this.addimg.visible = false;
            posx = this.width * 0.5 - 55 * this.dpr;
        } else {
            posx += 20 * this.dpr;
            if (!this.addimg) {
                this.addimg = this.scene.make.image({ key: this.key, frame: "recharge_diamond_gift" });
                this.add(this.addimg);
            } else {
                this.addimg.visible = true;
            }
        }
        for (let i = 0; i < matrr.length; i++) {
            let item: PropItem;
            const tempdata = matrr[i];
            if (i < this.giftbags.length) {
                item = this.giftbags[i];
            } else {
                item = new PropItem(this.scene, this.key, "recharge_diamond_gift", this.dpr, this.zoom);
                item.enable = true;
                this.giftbags.push(item);
                this.add(item);
            }
            item.setItemData(tempdata);
            item.visible = true;
            item.x = posx + item.width * 0.5;
            item.y = 0;
            posx += item.width + 20 * this.dpr;
        }
    }
    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.runWith([100]);
    }
}

class TwoRechargeItem extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private bottombg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        this.bottombg = this.scene.make.image({ key, frame: "recharge_division" });
        this.setSize(width, height);
        this.add(this.bottombg);
        this.bottombg.y = this.height * 0.5 + this.bottombg.height * 0.5 - 1 * dpr;
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    public setTwoData() {
        for (let i = 0; i < 2; i++) {
            const item = new RechargeItem(this.scene, this.key, this.dpr, this.scale);
            item.setHandler(this.sendHandler);
            this.add(item);
            item.x = -item.width * 0.5 - 5 * this.dpr + i * (item.width + 10 * this.dpr);
        }
    }
}

class RechargeBanner extends SoundButton {
    private key: string;
    private frame: string;
    private banners: DynamicImage[];
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, frame: string, zoom: number) {
        super(scene, x, y);
        this.key = key;
        this.frame = frame;
        this.banners = [];
        this.setSize(width, height);
        this.setBannerData();
        this.enable = true;
    }

    public setBannerData() {
        let x = 0;
        for (let i = 0; i < 6; i++) {
            const img = new DynamicImage(this.scene, 0, 0, this.key, this.frame);
            this.banners.push(img);
            img.x = x;
            x += img.width + 10 * this.dpr;
        }
        this.add(this.banners);
    }

    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        super.onPointerMoveHandler(pointer);
        if (this.banners.length > 1) {
            this.moveBanner(pointer.deltaX);
        }
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        if (!this.interactiveBoo) {
            if (this.soundGroup && this.soundGroup.disabled)
                this.playSound(this.soundGroup.disabled);
            return;
        }
        if (this.mTweenBoo) {
            this.tween(false, this.pointerUp.bind(this, pointer));
        } else {
            this.pointerUp(pointer);
        }
    }

    protected moveBanner(detla: number) {
        for (const img of this.banners) {
            img.x += detla;
        }
    }

    protected tween(left: boolean, callback?: any) {
        this.mTweening = true;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
        this.mTween = this.scene.tweens.add({
            targets: this.list,
            duration: 45,
            ease: "Linear",
            x: 0,
            onComplete: () => {
                this.tweenComplete();
                if (callback) callback();
            },
            onCompleteParams: [this]
        });
    }

    protected tweenComplete() {
        this.mTweening = false;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
    }
}

enum TabButtonType {
    GIFT,
    PRIVILEGE,
    DIAMONO
}
