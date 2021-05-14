import { BBCodeText } from "apowophaserui";
import { Font, i18n, UIHelper } from "utils";

export class PicaTownNoNavigationPanel extends Phaser.GameObjects.Container {
    public dpr: number;
    private contentTex: BBCodeText;
    private noItemImg: Phaser.GameObjects.Image;
    private tipTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.contentTex = new BBCodeText(scene, 0, 0, "", {
            fontSize: 14 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            color: "#ffffff",
            wrap: {
                mode: "char",
                width: 271 * dpr
            }
        }).setOrigin(0.5, 1);
        this.contentTex.y = -height * 0.5 + 50 * dpr;
        this.contentTex.text = i18n.t("partynav.tooqingtips");
        this.noItemImg = this.scene.make.image({ key: "map_tooqing_stay_tuned" });
        this.noItemImg.y = this.contentTex.y + this.contentTex.height + this.noItemImg.height * 0.5 + 50 * dpr;
        this.tipTex = this.scene.make.text({ style: UIHelper.colorStyle("#339CDE", 14 * dpr) }).setOrigin(0.5);
        this.tipTex.text = "敬请期待...";
        this.tipTex.y = this.noItemImg.y + 60 * dpr;
        this.add([this.contentTex, this.noItemImg, this.tipTex]);
    }
}
