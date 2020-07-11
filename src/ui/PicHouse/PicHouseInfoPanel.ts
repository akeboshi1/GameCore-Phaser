import { Font } from "../../utils/font";
import { op_client, op_def, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { i18n } from "../../i18n";
import { BBCodeText } from "../../../lib/rexui/lib/ui/ui-components";
export class PicHouseInfoPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    private roomname: HouseAttributeValue;
    private roomlevel: HouseAttributeValue;
    private expvalue: HouseAttributeValue;
    private popvalue: HouseAttributeValue;
    private goodvalue: HouseAttributeValue;
    private compviness: HouseAttributeValue;
    private prosprity: HouseAttributeValue;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.key = key;
        this.dpr = dpr;
        this.setSize(width, height);
        this.createAttribute();
    }
    public setAttributeData(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.roomname.setTextInfo(i18n.t("room_info.roomname"), data.name);
        this.roomlevel.setImageInfo(i18n.t("room_info.roomlevel"), this.key, this.getLevelImgs());
        const expvalue = `[color=#0D8288]${"151465416"}[/color]/30000000`;
        this.expvalue.setTextInfo(i18n.t("room_info.expvalue"), expvalue);
        this.popvalue.setImageInfo(i18n.t("room_info.popvalue"), this.key, this.getpopImgs());
        this.goodvalue.setImageInfo(i18n.t("room_info.popvalue"), this.key, this.getgoodImgs(data.roomLevel));
        this.compviness.setTextInfo(i18n.t("room_info.popvalue"), "16525");
        this.prosprity.setTextInfo(i18n.t("room_info.popvalue"), "68");
    }
    createAttribute() {
        let posy = -this.height * 0.5;
        const itemHeight = 20 * this.dpr;
        const itemWidth = this.width;
        const space = 20 * this.dpr + itemHeight;

        this.roomname = new HouseAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.roomlevel = new HouseAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.expvalue = new HouseAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.popvalue = new HouseAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.goodvalue = new HouseAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.compviness = new HouseAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.prosprity = new HouseAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        this.add([this.roomname, this.roomlevel, this.expvalue, this.popvalue, this.goodvalue, this.compviness, this.prosprity]);

    }
    private getLevelImgs() {
        return ["sun", "moon", "star", "star", "star"];
    }

    private getpopImgs() {
        return ["popularity", "popularity", "popularity", "popularity", "popularity"];
    }

    private getgoodImgs(level: op_pkt_def.IPKT_Level) {
        return ["good", "good", "good", "good1", "good1"];
    }

}
class HouseAttributeValue extends Phaser.GameObjects.Container {
    private nameText: Phaser.GameObjects.Text;
    private valueText: BBCodeText;
    private imgCon: Phaser.GameObjects.Container;
    private dpr: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.nameText = this.scene.make.text({
            x: -width * 0.5 + 15 * dpr, y: 0, text: "Room name",
            style: { fontFamily: Font.BOLD_FONT, fontSize: 16 * dpr, color: "#FFC51A" }
        }).setOrigin(0, 0.5).setStroke("#0", 4);
        this.valueText = new BBCodeText(this.scene, 0, 0, "This my Room", {
            color: "#000000",
            fontSize: 16 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0, 0.5);
        this.imgCon = this.scene.make.container(undefined, false);
        this.imgCon.x = 10 * dpr;
        this.add([this.nameText, this.valueText, this.imgCon]);
    }

    public setTextInfo(name: string, value: string) {
        this.nameText.text = name;
        this.valueText.text = value;
    }

    public setImageInfo(name: string, key: string, imgs: string[]) {
        let posX = 0;
        const space: number = 20 * this.dpr;
        for (const frame of imgs) {
            const image = this.scene.make.image({ key, frame });
            posX += image.width * 0.5;
            image.x = posX;
            posX += image.width * 0.5 + space;
            this.imgCon.add(image);
        }
    }
}
