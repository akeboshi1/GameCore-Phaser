import { Font } from "../../game/core/utils/font";
import { op_client } from "pixelpai_proto";
import { NineSlicePatch, BBCodeText, IPatchesConfig } from "apowophaserui";
import { i18n } from "../../game/core/utils/i18n";

export class ItemInfoTips extends Phaser.GameObjects.Container {
    private tipsbg: NineSlicePatch;
    private tipsText: Phaser.GameObjects.Text;
    private dpr: number;
    private key: string;
    private config: IPatchesConfig;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, bg: string, dpr: number, config?: IPatchesConfig) {
        super(scene);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        this.config = config ? config : {
            left: 20 * this.dpr,
            top: 20 * this.dpr,
            right: 20 * this.dpr,
            bottom: 20 * this.dpr
        };
        this.create(bg);
    }
    public setText(text: string) {
        this.tipsText.text = text;
        const tipsHeight = this.tipsText.height + 20 * this.dpr;
        const tipsWidth = this.tipsbg.width;
        this.setSize(tipsWidth, tipsHeight);
        this.tipsbg.resize(tipsWidth, tipsHeight);
        this.tipsbg.y = -this.tipsbg.height * 0.5;
        this.tipsText.y = -tipsHeight + 10 * this.dpr;
    }
    public setItemData(data: op_client.ICountablePackageItem) {
        const tex = this.getDesText(data);
        this.setText(tex);
    }
    private create(bg: string) {
        const tipsWidth = this.width;
        const tipsHeight = this.height;
        const tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, this.key, bg, this.config, undefined, undefined, 0);
        tipsbg.setPosition(0, -tipsHeight * 0.5);
        this.tipsbg = tipsbg;
        const tipsText = new BBCodeText(this.scene, -this.width * 0.5 + 10 * this.dpr, -tipsHeight + 60 * this.dpr, "", {
            color: "#333333",
            fontSize: 13 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            wrap: {
                width: this.width - 15 * this.dpr,
                mode: "string"
            }
        }).setOrigin(0);

        this.tipsText = tipsText;
        this.add([tipsbg, tipsText]);
    }
    private getDesText(data: op_client.ICountablePackageItem) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        let text: string = `[stroke=#2640CA][color=#2640CA][b]${data.name}[/b][/color][/stroke]` + "\n";
        let source = `[stroke=#2640CA][color=#2640CA]${i18n.t("common.source")}[/color][/stroke]：`;
        source += data.source;
        text += source + "\n";
        let description = `[stroke=#2640CA][color=#2640CA]${i18n.t("common.description")}[/color][/stroke]：`;
        description += data.des;
        text += description;
        return text;
    }
}