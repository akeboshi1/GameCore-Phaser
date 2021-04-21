import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, ClickEvent } from "apowophaserui";
import { Font, Handler, i18n, Tool, UIHelper } from "utils";
import { ItemInfoTips } from "gamecoreRender";
import { UIAtlasKey } from "../../../res";
export class PicaRoomInfoPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private roomName: RoomAttributeValue;
    private roomlevel: RoomAttributeValue;
    private expvalue: RoomAttributeValue;
    private popvalue: RoomAttributeValue;
    private goodvalue: RoomAttributeValue;
    private compviness: RoomAttributeValue;
    private turnover: RoomAttributeValue;
    private deprecia: RoomAttributeValue;
    private renovateBtn: Button;
    private help: Button;
    private equirementsHandler: Handler;
    private helptips: ItemInfoTips;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.createAttribute();

    }
    public setAttributeData(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.roomName.setTextInfo(i18n.t("room_info.roomname"), data.name);
        let level = 0;
        let curExp = 0;
        let nexExp = 0;
        if (data.roomLevel) {
            level = data.roomLevel.level;
            curExp = data.roomLevel.currentLevelExp ? data.roomLevel.currentLevelExp : 0;
            nexExp = data.roomLevel.nextLevelExp ? data.roomLevel.nextLevelExp : 0;
        }
        this.roomlevel.setImageInfo(i18n.t("room_info.roomlevel"), UIAtlasKey.common2Key, this.getLevelImgs(level));
        const expvalue = `[color=#0D8288]${curExp}[/color]/${nexExp}`;
        this.expvalue.setTextInfo(i18n.t("room_info.expvalue"), expvalue);
        this.popvalue.setTextInfo(i18n.t("room_info.popvalue"), data.popularity + "");
        this.goodvalue.setTextInfo(i18n.t("room_info.goodvalue"), data.praise + "");
        if (data.roomType === "store") {
            this.compviness.visible = true;
            this.turnover.visible = true;
            this.deprecia.visible = true;
            this.compviness.setTextInfo(i18n.t("room_info.compveness"), data.competitiveness + "");
            let turnovervalue = "";
            if (data.turnoverProp.tempValue > 0) {
                turnovervalue = `${data.turnoverProp.value}(+${data.turnoverProp.tempValue})`;
            } else if (data.turnoverProp.tempValue < 0) {
                turnovervalue = `${data.turnoverProp.value}[color=#ff0000](${data.turnoverProp.tempValue})[/color]`;
            } else {
                turnovervalue = `${data.turnoverProp.value}`;
            }
            this.turnover.setTextInfo(i18n.t("room_info.turnover"), turnovervalue);
            this.deprecia.setTextInfo(i18n.t("room_info.depreciation"), Math.floor(data.undepreciated * 100) + "%");
            this.add([this.compviness, this.turnover, this.deprecia, this.helptips]);
            this.deprecia.add([this.renovateBtn, this.help]);
        } else {
            this.compviness.visible = false;
            this.turnover.visible = false;
            this.deprecia.visible = false;
            this.remove([this.compviness, this.turnover, this.deprecia, this.helptips]);
        }

    }

    public setHandler(equirements: Handler) {
        this.equirementsHandler = equirements;
    }

    createAttribute() {
        let posy = -this.height * 0.5 + 10 * this.dpr;
        const itemHeight = 20 * this.dpr;
        const itemWidth = this.width;
        const space = 20 * this.dpr + itemHeight;

        this.roomName = new RoomAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.roomlevel = new RoomAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.expvalue = new RoomAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.popvalue = new RoomAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.goodvalue = new RoomAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.compviness = new RoomAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.turnover = new RoomAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        posy += space;
        this.deprecia = new RoomAttributeValue(this.scene, 0, posy, itemWidth, itemHeight, this.dpr);
        this.renovateBtn = new Button(this.scene, UIAtlasKey.commonKey, "order_yellow_butt", "order_yellow_butt", i18n.t("room_info.renovate"));
        this.renovateBtn.scale = 1.1;
        this.renovateBtn.setTextStyle({ fontSize: 12 * this.dpr, color: "#ED7814" });
        this.renovateBtn.on(String(ClickEvent.Tap), this.onRenovateHandler, this);
        this.renovateBtn.x = this.width * 0.5 - 60 * this.dpr;
        this.help = new Button(this.scene, UIAtlasKey.common2Key, "icon_tips", "icon_tips");
        this.help.x = this.width * 0.5 - 20 * this.dpr;
        this.help.on(String(ClickEvent.Tap), this.onHelpHandler, this);
        this.deprecia.add([this.renovateBtn, this.help]);
        this.helptips = new ItemInfoTips(this.scene, 140 * this.dpr, 46 * this.dpr, UIAtlasKey.common2Key, "tips_bg", this.dpr);
        this.helptips.x = 60 * this.dpr;
        this.helptips.y = this.deprecia.y - 20 * this.dpr;
        this.helptips.setText(i18n.t("room_info.helptips"), 1);
        this.helptips.setInvalidArea(Tool.getRectangle(this.help, this.scene));
        this.helptips.setVisible(false);
        this.add([this.roomName, this.roomlevel, this.expvalue, this.popvalue, this.goodvalue]);
    }

    private onRenovateHandler() {
        if (this.equirementsHandler) this.equirementsHandler.run();
    }
    private onHelpHandler() {
        this.helptips.setVisible(!this.helptips.visible);
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
class RoomBaseAttribute extends Phaser.GameObjects.Container {
    public dpr: number;
    public zoom: number;
    public title: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.title = this.scene.make.text({ style: UIHelper.blackStyle(dpr, 14) }).setOrigin(0, 0.5);
        this.title.x = -this.width * 0.5;
        this.add(this.title);
    }

    public setAttributeData(title: string, value: string) {

    }
}
class RoomNameAttribute extends Phaser.GameObjects.Container {

}
class RoomStateAttribute extends RoomBaseAttribute {

}
class RoomAttributeValue extends Phaser.GameObjects.Container {
    private nameText: Phaser.GameObjects.Text;
    private valueText: BBCodeText;
    private imgCon: Phaser.GameObjects.Container;
    private dpr: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.nameText = this.scene.make.text({
            x: -width * 0.5 + 15 * dpr, y: 0, text: "",
            style: { fontFamily: Font.DEFULT_FONT, fontSize: 14 * dpr, color: "#FFC51A" }
        }).setOrigin(0, 0.5).setResolution(dpr);
        this.valueText = new BBCodeText(this.scene, 0, 0, "", {
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
        (<any>this.valueText).visible = false;
    }
}
