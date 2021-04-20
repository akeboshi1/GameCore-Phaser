import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { Font, Handler, i18n, Tool, UIHelper } from "utils";
import { InputField, ItemInfoTips } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ImageValue } from "../Components";
export class PicaRoomInfoPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private roomName: RoomNameAttribute;
    private roomState: RoomStateAttribute;
    private roomEvaluate: RoomEvaluateAttribute;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.createAttribute();

    }
    public setAttributeData(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        // this.roomName.setTextInfo(i18n.t("room_info.roomname"), data.name);
        // let level = 0;
        // let curExp = 0;
        // let nexExp = 0;
        // if (data.roomLevel) {
        //     level = data.roomLevel.level;
        //     curExp = data.roomLevel.currentLevelExp ? data.roomLevel.currentLevelExp : 0;
        //     nexExp = data.roomLevel.nextLevelExp ? data.roomLevel.nextLevelExp : 0;
        // }
        // this.roomlevel.setImageInfo(i18n.t("room_info.roomlevel"), UIAtlasKey.common2Key, this.getLevelImgs(level));
        // const expvalue = `[color=#0D8288]${curExp}[/color]/${nexExp}`;
        // this.expvalue.setTextInfo(i18n.t("room_info.expvalue"), expvalue);
        // this.popvalue.setTextInfo(i18n.t("room_info.popvalue"), data.popularity + "");
        // this.goodvalue.setTextInfo(i18n.t("room_info.goodvalue"), data.praise + "");
        // if (data.roomType === "store") {
        //     this.compviness.visible = true;
        //     this.turnover.visible = true;
        //     this.deprecia.visible = true;
        //     this.compviness.setTextInfo(i18n.t("room_info.compveness"), data.competitiveness + "");
        //     let turnovervalue = "";
        //     if (data.turnoverProp.tempValue > 0) {
        //         turnovervalue = `${data.turnoverProp.value}(+${data.turnoverProp.tempValue})`;
        //     } else if (data.turnoverProp.tempValue < 0) {
        //         turnovervalue = `${data.turnoverProp.value}[color=#ff0000](${data.turnoverProp.tempValue})[/color]`;
        //     } else {
        //         turnovervalue = `${data.turnoverProp.value}`;
        //     }
        //     this.turnover.setTextInfo(i18n.t("room_info.turnover"), turnovervalue);
        //     this.deprecia.setTextInfo(i18n.t("room_info.depreciation"), Math.floor(data.undepreciated * 100) + "%");
        //     this.add([this.compviness, this.turnover, this.deprecia, this.helptips]);
        //     this.deprecia.add([this.renovateBtn, this.help]);
        // } else {
        //     this.compviness.visible = false;
        //     this.turnover.visible = false;
        //     this.deprecia.visible = false;
        //     this.remove([this.compviness, this.turnover, this.deprecia, this.helptips]);
        // }

    }

    public setHandler(equirements: Handler) {
        // this.equirementsHandler = equirements;
    }

    createAttribute() {
        let posy = -this.height * 0.5 + 10 * this.dpr;
        const itemHeight = 20 * this.dpr;
        const itemWidth = this.width;
        const space = 20 * this.dpr + itemHeight;

        this.roomName = new RoomNameAttribute(this.scene, itemWidth, itemHeight, this.dpr, this.zoom);
        this.roomName.y = posy;
        posy += space;
        this.roomState = new RoomStateAttribute(this.scene, itemWidth, itemHeight, this.dpr, this.zoom);
        this.roomState.y = posy;
        posy += space;
        this.roomEvaluate = new RoomEvaluateAttribute(this.scene, itemWidth, itemHeight, this.dpr, this.zoom);
        this.roomEvaluate.y = posy;
        posy += space;
        this.add([this.roomName, this.roomState, this.roomEvaluate]);
    }
}
class RoomBaseAttribute extends Phaser.GameObjects.Container {
    public dpr: number;
    public zoom: number;
    public title: Phaser.GameObjects.Text;
    public send: Handler;
    public offset: number = 0;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.offset = 13 * dpr;
        this.setSize(width, height);
        this.title = this.scene.make.text({ style: UIHelper.blackStyle(dpr, 14) }).setOrigin(0, 0.5);
        this.title.x = -this.width * 0.5;
        this.add(this.title);
    }

    public setAttributeData(data: any) {

    }
}
class RoomNameAttribute extends RoomBaseAttribute {
    private mNameInput: InputField;
    private saveBtn: Button;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, width, height, dpr, zoom);
        this.title.text = i18n.t("room_info.roomname");
        const inputX = this.title.x + this.width + this.offset;
        this.mNameInput = this.createInput(inputX, 0, 204 * this.dpr, 34 * this.dpr, 14 * this.dpr);
        this.mNameInput.on("textchange", this.onTextChangeHandler, this);
        this.saveBtn = new Button(this.scene, UIAtlasName.room_info, "room_name_edit");
        this.saveBtn.on(ClickEvent.Tap, this.onSaveHandler, this);
    }
    private createInput(x: number, y: number, width: number, height: number, font: number, type: string = "text") {
        const mblackbg = this.scene.make.graphics(undefined, false);
        mblackbg.fillStyle(0xA4EFF3, 0.66);
        mblackbg.fillRoundedRect(0, -height * 0.5, width, height, 6 * this.dpr);
        mblackbg.setPosition(x, y);
        this.add(mblackbg);
        const input = new InputField(this.scene, x + width * 0.5 + 8 * this.dpr, y, width, height - 10 * this.dpr, {
            type,
            placeholder: i18n.t("party.partydescrible"),
            color: "#055C62",
            fontSize: font + "px"
        });
        this.add(input);
        return input;
    }
    private onTextChangeHandler() {
        const width = 170 * this.dpr;
        this.mNameInput.text = UIHelper.spliceText(width, this.mNameInput.text, 13 * this.dpr, this.scene);
    }

    private onSaveHandler() {
        let save = true;
        const text = this.mNameInput.text;
        if (text === "") {
            save = false;
        }
        if (this.send) this.send.runWith([save, text]);
    }
}
class RoomStateAttribute extends RoomBaseAttribute {
    private tipImag: Phaser.GameObjects.Image;
    private tipTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, width, height, dpr, zoom);
        this.title.text = i18n.t("room_info.state");
        this.tipImag = this.scene.make.image({ key: UIAtlasName.room_info, frame: "room_status_party" }).setOrigin(0, 0.5);
        this.tipTex = this.scene.make.text({ text: i18n.t("room_info.commontips"), style: UIHelper.blackStyle(dpr, 14) }).setOrigin(0, 0.5);
        this.tipImag.x = this.title.x + this.title.width + this.offset;
        this.tipTex.x = this.tipImag.x;
        this.add([this.tipImag, this.tipTex]);
        this.tipImag.visible = false;
    }
    public setAttributeData(open: boolean) {
        this.tipImag.visible = open;
        this.tipTex.visible = !open;
    }
}
class RoomEvaluateAttribute extends RoomBaseAttribute {
    private tipTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, width, height, dpr, zoom);
        this.title.text = i18n.t("room_info.state");
        this.tipTex = this.scene.make.text({ text: i18n.t("room_info.commontips"), style: UIHelper.colorStyle("#1DB4E9", dpr * 14) }).setOrigin(0, 0.5);
        this.tipTex.x = this.title.x + this.title.width + this.offset;
        this.add([this.tipTex]);
    }
    public setAttributeData(value: number) {
        this.tipTex.text = value + "";
    }
}

class RoomPartyInfoPanel extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Graphics;
    private titlebg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private partybg: Phaser.GameObjects.Image;
    private partyIcon: Phaser.GameObjects.Image;
    private timeValue: PartyTimeValue;
    private cardTips: Phaser.GameObjects.Text;
    private countImg: ImageValue;
    private openButton: NineSliceButton;
    constructor(scene, dpr: number) {
        super(scene);
        const width = 293 * dpr;
        const height = 237 * dpr;
        this.setSize(width, height);
        this.bg = this.scene.make.graphics(undefined, false);
        this.bg.fillStyle(0xC5EDFC, 1);
        this.bg.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, 4 * dpr);
        this.titlebg = this.scene.make.image({ key: UIAtlasName.room_info, frame: "room_party_status_title" });
    }
}
class PartyTimeValue extends Phaser.GameObjects.Container {
    private timeImg: TimeImageValue[];
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.create();
    }
    public setTimeValue(time: number) {
        const date = new Date(time * 1000);
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        let timeTex = hour >= 10 ? `${hour}` : `0${hour}`;
        timeTex += minute >= 10 ? `${minute}` : `0${minute}`;
        timeTex += second >= 10 ? `${second}` : `0${second}`;
        for (let i = 0; i < timeTex.length; i++) {
            this.timeImg[i].setValue(timeTex[i]);
        }
    }
    private create() {
        let width: number = 0;
        for (let i = 0; i < 6; i++) {
            const timeImg = new TimeImageValue(this.scene, this.dpr);
            this.timeImg.push(timeImg);
            timeImg.x = width;
            if (i === 2 || i === 4) {
                width += timeImg.width * 0.5;
                const tips = this.scene.make.text({ text: " : ", style: UIHelper.blackStyle(this.dpr, 14) });
                tips.x = width + tips.width * 0.5;
                width += timeImg.width * 0.5 + tips.width * 0.5;
                this.add([timeImg, tips]);
            } else {
                width += timeImg.width + 2 * this.dpr;
                this.add(timeImg);
            }
        }
        for (const img of this.timeImg) {
            img.x -= width * 0.5;
        }
    }
}
class TimeImageValue extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private value: Phaser.GameObjects.Text;
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.bg = this.scene.make.image({ key: UIAtlasName.room_info, frame: "room_party_countdown" });
        this.value = this.scene.make.text({ text: 0, style: UIHelper.whiteStyle(dpr, 16) });
        this.value.setFontStyle("bold");
        this.add([this.bg, this.value]);
        this.setSize(this.bg.width, this.bg.height);
    }
    public setValue(value: string) {
        this.value.text = value;
    }
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
