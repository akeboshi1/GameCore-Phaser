import { Font } from "../../utils/font";
import { op_client, op_def, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { i18n } from "../../i18n";
import { BBCodeText } from "../../../lib/rexui/lib/ui/ui-components";
import { UIAtlasKey } from "../ui.atals.name";
export class PicHouseInfoPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private key: string;
    private roomname: HouseAttributeValue;
    private roomlevel: HouseAttributeValue;
    private expvalue: HouseAttributeValue;
    private popvalue: HouseAttributeValue;
    private goodvalue: HouseAttributeValue;
    private compviness: HouseAttributeValue;
    private turnover: HouseAttributeValue;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.key = key;
        this.dpr = dpr;
        this.setSize(width, height);
        this.createAttribute();
    }
    public setAttributeData(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.roomname.setTextInfo(i18n.t("room_info.roomname"), data.name);
        let level = 0;
        let curExp = 0;
        let nexExp = 0;
        if (data.roomLevel) {
            level = data.roomLevel.level;
            curExp = data.roomLevel.currentLevelExp ? data.roomLevel.currentLevelExp : 0;
            nexExp = data.roomLevel.nextLevelExp ? data.roomLevel.nextLevelExp : 0;
        }
        this.roomlevel.setImageInfo(i18n.t("room_info.roomlevel"), UIAtlasKey.common2Key, this.getLevelImgs(level));
        let expvalue = `[color=#0D8288]${curExp}[/color]/${nexExp}`;
        if (nexExp === 0) expvalue = "MAX";
        this.expvalue.setTextInfo(i18n.t("room_info.expvalue"), expvalue);
        this.popvalue.setImageInfo(i18n.t("room_info.popvalue"), this.key, this.getpopImgs());
        this.goodvalue.setImageInfo(i18n.t("room_info.goodvalue"), this.key, this.getgoodImgs());
        if (data.roomType === "store") {
            this.compviness.visible = true;
            this.turnover.visible = true;
            this.compviness.setTextInfo(i18n.t("room_info.compveness"), "16525");
            this.turnover.setTextInfo(i18n.t("room_info.turnover"), "68");
        } else {
            this.compviness.visible = false;
            this.turnover.visible = false;
        }

    }
    createAttribute() {
        let posy = -this.height * 0.5 + 10 * this.dpr;
        const itemHeight = 20 * this.dpr;
        const itemWidth = this.width;
        const space = 25 * this.dpr + itemHeight;

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
        this.turnover = new HouseAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        this.add([this.roomname, this.roomlevel, this.expvalue, this.popvalue, this.goodvalue, this.compviness, this.turnover]);

    }
    private getLevelImgs(level: number) {
        const power = 4;
        level = level ? level : 0;
        const imgs = [];
        const bearNum = Math.floor(level / Math.pow(power, 3));
        const value0 = level % Math.pow(power, 3);
        const sunNum = Math.floor(value0 / Math.pow(power, 2));
        const value1 = value0 % Math.pow(power, 2);
        const moon = Math.floor((value1) / Math.pow(power, 1));
        const value2 = value1 % Math.pow(power, 1);
        const star = value2;
        for (let i = 0; i < bearNum; i++) {
            imgs.push("bear");
        }
        for (let i = 0; i < sunNum; i++) {
            imgs.push("sun");
        }
        for (let i = 0; i < moon; i++) {
            imgs.push("moon");
        }
        for (let i = 0; i < star; i++) {
            imgs.push("star");
        }
        if (level === 0) imgs.push("star");
        return imgs;
    }

    private getpopImgs() {
        return ["popularity", "popularity", "popularity", "popularity", "popularity"];
    }

    private getgoodImgs() {
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
            style: { fontFamily: Font.BOLD_FONT, fontSize: 14 * dpr, color: "#FFC51A" }
        }).setOrigin(0, 0.5).setStroke("#0", 4).setResolution(dpr);
        this.valueText = new BBCodeText(this.scene, 0, 0, "This my Room", {
            color: "#000000",
            fontSize: 13 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0, 0.5).setResolution(dpr);
        this.imgCon = this.scene.make.container(undefined, false);
        this.imgCon.x = 10 * dpr;
        this.add([this.nameText, this.valueText, this.imgCon]);
    }

    public setTextInfo(name: string, value: string) {
        this.nameText.text = name;
        this.valueText.text = value;
    }

    public setImageInfo(name: string, key: string, imgs: string[]) {
        this.nameText.text = name;
        let posX = 0;
        const space: number = 10 * this.dpr;
        for (const frame of imgs) {
            const image = this.scene.make.image({ key, frame });
            image.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            image.x = posX;
            posX += image.width * 0.5 + space;
            this.imgCon.add(image);
        }
        this.valueText.visible = false;
    }
}
