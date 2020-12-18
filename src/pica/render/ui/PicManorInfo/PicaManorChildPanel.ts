import { BBCodeText, Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { DynamicImage, InputView, Render } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { Font, Handler, i18n, Logger, UIHelper } from "utils";
import { PicaManorBasePanel } from "./PicaManorBasePanel";

export class PicaManorChildPanel extends PicaManorBasePanel {
    private editorButton: NineSliceButton;
    private shopButton: NineSliceButton;
    private buyButton: NineSliceButton;
    private headbg: Phaser.GameObjects.Image;
    private headIcon: DynamicImage;
    private nameTitle: Phaser.GameObjects.Text;
    private contentbg: Phaser.GameObjects.Image;
    private detailText: BBCodeText;
    private zoom: number;
    private sendHandler: Handler;
    private render: Render;
    constructor(scene: Phaser.Scene, render: Render, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string) {
        super(scene, x, y, width, height, dpr, key);
        this.zoom = zoom;
        this.render = render;
    }
    // "manorname": "庄园名称：",
    // "manorowner": "庄园主人：",
    // "manorarea": "所属街区：",
    // "manorstatus": "当前状态：",
    // "manorprice": "出售价格：",
    // "needlevel": "需求等级：
    public setManorInfoData(data: any) {// IManorBillboardData
        // const datas = content.storeList;
        this.nameTitle.text = "某某某某某";
        let type = 2;
        if (data.alreadyBuy) {
            type = data.myowner ? 1 : 3;
        }
        this.setLayout(type, data);
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    protected create() {
        super.create();
        const posy = -this.height * 0.5;
        this.headbg = this.scene.make.image({ key: this.key, frame: "finca_master_head frame" });
        this.headbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.headbg.y = posy + this.headbg.height * 0.5 + 40 * this.dpr;
        this.add(this.headbg);
        this.headIcon = new DynamicImage(this.scene, 0, 0, this.key, "finca_master_head");
        this.add(this.headIcon);
        this.headIcon.x = this.headbg.x;
        this.headIcon.y = this.headbg.y;
        const namey = this.headbg.y + this.headbg.height * 0.5 + 5 * this.dpr;
        this.nameTitle = this.scene.make.text({ x: this.headbg.x, y: namey + 10 * this.dpr, text: "", style: { fontSize: 17 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#000000" } }).setOrigin(0.5);
        this.nameTitle.setFontStyle("bold");
        this.add(this.nameTitle);
        this.contentbg = this.scene.make.image({ key: this.key, frame: "finca_message_panel" });
        this.contentbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.contentbg.y = this.nameTitle.y + this.contentbg.height * 0.5 + 30 * this.dpr;
        this.add(this.contentbg);
        this.contentbg.visible = false;
        this.detailText = new BBCodeText(this.scene, -this.contentbg.width * 0.5 + 20 * this.dpr, this.contentbg.y, "", {
            fontSize: 13 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#813D01",
            align: "left",
            wrap: {
                mode: "char",
                width: 240 * this.dpr
            }
        }).setInteractive()
            .on("areadown", (key) => {
                Logger.getInstance().log(key);
            })
            .on("areaup", (key) => {
                // tslint:disable-next-line:no-console
                new InputView(this.scene, this.render).show({
                    title: i18n.t("manor.eidtnickname"),
                    placeholder: i18n.t("manor.nicknameplaceholder"),
                    handler: new Handler(this, (text: string) => {
                        if (this.sendHandler) this.sendHandler.runWith([3, text]);// 3: op_pkt_def.PKT_MANOR_OP.PKT_MANOR_OP_Change_Name
                    })
                });
            });
        this.detailText.setOrigin(0, 0.5);
        this.add(this.detailText);
        (<any>(this.detailText)).visible = false;
        this.detailText.addImage("finca_compile", { key: this.key, frame: "finca_compile", y: 3 * this.dpr, left: 10 * this.dpr, right: 10 * this.dpr });
        this.detailText.addImage("iv_coin", { key: UIAtlasKey.commonKey, frame: "iv_coin", y: -1 * this.dpr, left: 2 * this.dpr, right: 5 * this.dpr });
        this.detailText.addImage("iv_diamond", { key: UIAtlasKey.commonKey, frame: "iv_diamond", y: -1 * this.dpr, left: 2 * this.dpr, right: 5 * this.dpr });
        this.editorButton = this.createNineButton(130 * this.dpr, 45 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("manor.editorbtn"), "#ffffff");
        this.editorButton.x = -this.editorButton.width * 0.5 - 10 * this.dpr;
        this.editorButton.y = this.height * 0.5 - this.editorButton.height * 0.5 - 10 * this.dpr;
        this.editorButton.on(String(ClickEvent.Tap), this.onEditorButtonHandler, this);
        this.add(this.editorButton);
        this.editorButton.visible = false;
        this.shopButton = this.createNineButton(130 * this.dpr, 45 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_normal", i18n.t("common.shop"), "#996600");
        this.shopButton.x = this.shopButton.width * 0.5 + 10 * this.dpr;
        this.shopButton.y = this.height * 0.5 - this.shopButton.height * 0.5 - 10 * this.dpr;
        this.shopButton.on(String(ClickEvent.Tap), this.onShopButtonHandler, this);
        this.add(this.shopButton);
        this.shopButton.visible = false;
        this.buyButton = this.createNineButton(181 * this.dpr, 45 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_normal", i18n.t("common.buy"), "#996600");
        this.buyButton.y = this.height * 0.5 - this.buyButton.height * 0.5 - 10 * this.dpr;
        this.buyButton.on(String(ClickEvent.Tap), this.onBuyButtonHandler, this);
        this.add(this.buyButton);
        this.buyButton.visible = false;
    }

    /**
     *
     * @param type 1 - 自己的庄园，2 -无主的庄园 ，3 -别人的庄园
     */
    protected setLayout(type, data: any) {// IManorBillboardData
        if (type === 3) {
            this.nameTitle.text = data.ownerName;
            this.nameTitle.visible = true;
            (<any>(this.detailText)).setLineSpacing(20 * this.dpr);
            this.headbg.visible = true;
            this.headbg.y = -this.height * 0.5 + 80 * this.dpr;
            this.headIcon.y = this.headbg.y;
            this.nameTitle.y = this.headbg.y + this.headbg.height * 0.5 + 16 * this.dpr;
            this.contentbg.y = this.contentbg.height * 0.5 + this.nameTitle.y + this.nameTitle.height * 0.5 + 10 * this.dpr;
            this.detailText.y = this.contentbg.y;
        } else if (type === 2) {
            this.nameTitle.text = i18n.t("manor.noowner");
            this.nameTitle.visible = true;
            (<any>(this.detailText)).setLineSpacing(9 * this.dpr);
            this.headbg.visible = false;
            this.headIcon.setTexture(this.key, "finca_dereliction_head");
            this.headIcon.y = -this.height * 0.5 + 68 * this.dpr;
            this.nameTitle.y = this.headIcon.y + this.headIcon.height * 0.5 + 16 * this.dpr;
            this.contentbg.y = this.contentbg.height * 0.5 + this.nameTitle.y + this.nameTitle.height * 0.5 + 10 * this.dpr;
            this.detailText.y = this.contentbg.y;
            this.buyButton.y = this.height * 0.5 - this.buyButton.height * 0.5 - 22 * this.dpr;
        } else {
            this.nameTitle.visible = false;
            this.headbg.visible = true;
            this.headIcon.setTexture(this.key, "finca_master_head");
            this.headIcon.y = this.headbg.y;
            this.contentbg.y = this.contentbg.height * 0.5 + this.headbg.y + this.headbg.height * 0.5 + 10 * this.dpr;
            this.detailText.y = this.contentbg.y;
            (<any>(this.detailText)).setLineSpacing(14 * this.dpr);
            this.editorButton.y = this.height * 0.5 - this.editorButton.height * 0.5 - 22 * this.dpr;
            this.shopButton.y = this.editorButton.y;
        }
        this.contentbg.visible = true;
        (<any>(this.detailText)).visible = true;
        this.setButtonActive(type);
        const text = this.getDetailText(type, data);
        this.detailText.setText(text);
    }
    protected setButtonActive(type) {
        if (type === 1) {
            this.editorButton.setInteractive();
            this.shopButton.setInteractive();
            this.buyButton.disInteractive();
            this.editorButton.visible = true;
            this.shopButton.visible = true;
            this.buyButton.visible = false;
        } else if (type === 2) {
            this.editorButton.disInteractive();
            this.shopButton.disInteractive();
            this.buyButton.setInteractive();
            this.editorButton.visible = false;
            this.shopButton.visible = false;
            this.buyButton.visible = true;
        } else {
            this.editorButton.disInteractive();
            this.shopButton.disInteractive();
            this.buyButton.disInteractive();
            this.editorButton.visible = false;
            this.shopButton.visible = false;
            this.buyButton.visible = false;
        }
    }

    protected getDetailText(type, data: any) {// IManorBillboardData
        let text = "";
        if (type === 3) {
            text = `${i18n.t("manor.manorname")}${data.manorName}\n` +
                `${i18n.t("manor.manorarea")}${data.streetName}`;
        } else if (type === 2) {
            const img = "iv_coin";// Coin.getIcon(data.price.coinType);
            // const powValue = Math.pow(10, data.price.displayPrecision);
            const price = data.price.price;// Math.floor(data.price.price * powValue) / powValue + "";
            text = `${i18n.t("manor.manorarea")}${data.streetName}\n` +
                `${i18n.t("manor.manorstatus")}[color=#FF0000]${i18n.t("manor.selling")}[/color]\n` +
                `${i18n.t("manor.manorprice")}[img=${img}]${price}\n` +
                `${i18n.t("manor.needlevel")}${"20级"}`;
        } else {
            text = `${i18n.t("manor.manorname")}${data.manorName}[area=aaaa][img=finca_compile][/area]\n` +
                `${i18n.t("manor.manorowner")}${data.ownerName}\n` +
                `${i18n.t("manor.manorarea")}${data.streetName}`;
        }
        return text;
    }

    private createNineButton(width: number, height: number, key: string, frame: string, text: string, color: string) {
        const nineButton = new NineSliceButton(this.scene, 0, 0, width, height, key, frame, text, this.dpr, this.zoom, UIHelper.button(this.dpr));
        this.add(nineButton);
        nineButton.setTextStyle({ fontSize: 21 * this.dpr, fontFamily: Font.DEFULT_FONT, color });
        nineButton.setFontStyle("bold");
        return nineButton;
    }
    private onEditorButtonHandler() {
        if (this.sendHandler) this.sendHandler.runWith([2]);// op_pkt_def.PKT_MANOR_OP.PKT_MANOR_OP_Edit
    }

    private onShopButtonHandler() {
        if (this.sendHandler) this.sendHandler.runWith([-1]);
    }

    private onBuyButtonHandler() {
        if (this.sendHandler) this.sendHandler.runWith([1]);// op_pkt_def.PKT_MANOR_OP.PKT_MANOR_OP_Buy
    }
}
