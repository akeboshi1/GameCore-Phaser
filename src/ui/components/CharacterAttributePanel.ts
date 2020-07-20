import { Font } from "../../utils/font";
import { op_pkt_def } from "pixelpai_proto";
import { BBCodeText } from "@apowo/phaserui";
export class CharacterAttributePanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private attriItems: PlayerAttributeValue[] = [];
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
    }

    setAttributeData(datas: op_pkt_def.IPKT_Property[]) {
        const len = datas.length;
        const scaleRadio = (len > 4 ? 2 : 1);
        const width = this.width - 28 * this.dpr;
        const height = this.height;
        const cheight = 20 * this.dpr;
        const cwidth = width / 2;
        const offsetY = 20 * this.dpr;
        const posy: number = -height * 0.5+10*this.dpr;
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
            const x = (width - width / scaleRadio) * 0.5 * (i < 4 ? -1 : 1);
            const y = posy + cheight * 0.5 + (cheight + offsetY) * (i % 4);
            item.setPosition(x, y);
            item.setInfo(datas[i]);
            item.visible = true;
        }
    }

}
class PlayerAttributeValue extends Phaser.GameObjects.Container {
    private icon: Phaser.GameObjects.Image;
    private nameText: Phaser.GameObjects.Text;
    private valueText: BBCodeText;
    private dpr: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.icon = this.scene.make.image({ key, frame: "health" });
        this.icon.x = -width * 0.5 + this.icon.width * 0.5;
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
        // this.icon.setFrame("");
        this.nameText.text = data.name + ":";
        this.valueText.text = data.value + (data.tempValue ? this.getRichLabel(data.tempValue) : "");
    }
    private getRichLabel(tempValue: number, color = "#0B77CD") {
        const label = `[color=${color}](+${tempValue})[/color]`;
        return label;
    }
}
