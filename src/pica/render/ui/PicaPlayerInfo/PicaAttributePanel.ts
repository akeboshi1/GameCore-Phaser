import { op_pkt_def } from "pixelpai_proto";
import { BBCodeText } from "apowophaserui";
import { Font, Url } from "utils";
import { DynamicImage } from "gamecoreRender";
export class PicaAttributePanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private attriItems: PlayerAttributeValue[] = [];
    private mspace: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        this.mspace = 10 * dpr;
    }

    public set space(value: number) {
        this.mspace = value;
    }
    setAttributeData(datas: op_pkt_def.IPKT_Property[]) {
        const len = datas.length;
        const width = this.width;
        const height = this.height;
        const cheight = 20 * this.dpr;
        const cwidth = width / 2 - 20 * this.dpr;
        const posy: number = -height * 0.5 + 10 * this.dpr;
        for (const item of this.attriItems) {
            item.visible = false;
        }
        for (let i = 0; i < len; i++) {
            let item: PlayerAttributeValue;
            if (i < this.attriItems.length) {
                item = this.attriItems[i];
            } else {
                item = new PlayerAttributeValue(this.scene, 0, 0, cwidth, cheight, this.key, this.dpr);
                this.add(item);
                this.attriItems.push(item);
            }
            const x = (cwidth * 0.5) * (i % 2 === 0 ? -1 : 1) + 15 * this.dpr;
            const y = posy + cheight * 0.5 + (cheight + this.mspace) * Math.floor(i / 2);
            item.setPosition(x, y);
            item.setInfo(datas[i]);
            item.visible = true;
        }
    }

}
class PlayerAttributeValue extends Phaser.GameObjects.Container {
    private icon: DynamicImage;
    private nameText: Phaser.GameObjects.Text;
    private valueText: BBCodeText;
    private dpr: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.icon = new DynamicImage(this.scene, 0, 0);
        this.icon.x = -width * 0.5 + 10 * dpr;
        // this.icon.setTexture(key, "health");
        this.nameText = this.scene.make.text({
            x: this.icon.x + 13 * dpr, y: 0, text: "Attack:",
            style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * dpr, color: "#131313" }
        }).setOrigin(0, 0.5);
        this.valueText = new BBCodeText(this.scene, 0, 0, "100", {
            color: "#131313",
            fontSize: 11 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0, 0.5);
        this.valueText.x = this.nameText.x + this.nameText.width;
        this.add([this.icon, this.nameText, this.valueText]);
    }
    public setInfo(data: op_pkt_def.IPKT_Property) {
        if (data.display) {
            const url = Url.getOsdRes(data.display.texturePath);
            this.icon.load(url, this, () => {
                this.icon.displayWidth = 20 * this.dpr;
                this.icon.scaleY = this.icon.scaleX;
            });
        }
        // this.icon.setFrame(data.display.texturePath);
        this.nameText.text = data.name + ":";
        this.valueText.text = data.value + (data.tempValue ? this.getRichLabel(data.tempValue) : "");
        this.valueText.x = this.nameText.x + this.nameText.width + 3 * this.dpr;
    }
    private getRichLabel(tempValue: number, color = "#0B77CD") {
        const label = `[color=${color}](+${tempValue})[/color]`;
        return label;
    }
}
