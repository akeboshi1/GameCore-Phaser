import { ClickEvent, NineSliceButton } from "apowophaserui";
import { UIAtlasKey } from "picaRes";
import { Font, Handler, i18n } from "utils";
import { PicaManorBasePanel } from "./PicaManorBasePanel";

export class PicaManorTipsPanel extends PicaManorBasePanel {
    private nineButton: NineSliceButton;
    private contentText: Phaser.GameObjects.Text;
    private zoom: number;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string) {
        super(scene, x, y, width, height, dpr, key);
    }

    public setManorTipsData(tiptext: string) {
        this.contentText.text = tiptext;
        const type = 1;// 1 - 购买成功，2 - 购买失败
        this.nineButton.setFrameNormal("red_btn_normal");
        this.nineButton.setText(i18n.t("manor.otherbtn"));
        this.nineButton.setTextColor("#ffffff");
    }

    public setHandler(send: Handler) {
        this.sendHandler = send;
    }

    protected create() {
        super.create();
        const cx = 0;
        this.contentText = this.scene.make.text({ x: cx, y: -10 * this.dpr, text: i18n.t(""), style: { fontSize: 18 * this.dpr, align: "center", fontFamily: Font.DEFULT_FONT, color: "#111111" } }).setOrigin(0.5);
        this.contentText.setLineSpacing(20 * this.dpr);
        this.add(this.contentText);
        this.nineButton = new NineSliceButton(this.scene, 0, 0, 110 * this.dpr, 35 * this.dpr, UIAtlasKey.commonKey, "red_btn_normal", i18n.t("business_street.takeall"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(this.nineButton);
        this.nineButton.y = this.height * 0.5 - this.nineButton.height * 0.5 - 15 * this.dpr;
        this.nineButton.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#ffffff" });
        this.nineButton.setFontStyle("bold");
        this.nineButton.on(String(ClickEvent.Tap), this.onNineButtonHandler, this);
    }
    protected createBackground(width: number, height: number) {
        this.bg = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "bg_universal_box" });
        this.add(this.bg);
    }
    private onNineButtonHandler() {
        if (this.sendHandler) this.sendHandler.run();
    }
}
