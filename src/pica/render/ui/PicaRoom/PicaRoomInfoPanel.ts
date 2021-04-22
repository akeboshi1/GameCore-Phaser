import { op_client } from "pixelpai_proto";
import { ClickEvent, NineSliceButton } from "apowophaserui";
import { Handler, i18n, TimeUtils, UIHelper } from "utils";
import { UIAtlasName } from "picaRes";
import { ImageValue } from "../Components";
import { RoomEvaluateAttribute, RoomNameAttribute, RoomStateAttribute } from "./RoomBaseAttribute";
import { TimerCountDown } from "structure";
export class PicaRoomInfoPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private roomName: RoomNameAttribute;
    private roomState: RoomStateAttribute;
    private roomEvaluate: RoomEvaluateAttribute;
    private partyPanel: RoomPartyInfoPanel;
    private send: Handler;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.createAttribute();

    }
    public setAttributeData(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.roomName.setAttributeData(data.name + "这是一个测试名称");
        this.roomState.setAttributeData(data.openingParty);
        this.roomEvaluate.setAttributeData(data.praise);
    }

    public setPartyData(partyData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS) {
        this.partyPanel.setPartyData(partyData);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    public hide() {
        this.visible = false;
        this.roomName.hide();
    }

    public show() {
        this.visible = true;
        this.roomName.show();
    }
    createAttribute() {
        let posy = -this.height * 0.5 + 25 * this.dpr;
        const itemHeight = 34 * this.dpr;
        const itemWidth = this.width - 10 * this.dpr;
        const space = 20 * this.dpr + itemHeight;

        this.roomName = new RoomNameAttribute(this.scene, itemWidth, itemHeight, this.dpr, this.zoom, "text");
        this.roomName.setHandler(new Handler(this, this.onSendHandler));
        this.roomName.y = posy;
        posy += space;
        this.roomState = new RoomStateAttribute(this.scene, itemWidth, itemHeight, this.dpr, this.zoom);
        this.roomState.y = posy;
        posy += space - 5 * this.dpr;
        this.roomEvaluate = new RoomEvaluateAttribute(this.scene, itemWidth, itemHeight, this.dpr, this.zoom);
        this.roomEvaluate.y = posy;
        this.partyPanel = new RoomPartyInfoPanel(this.scene, this.dpr);
        this.partyPanel.y = posy + this.partyPanel.height * 0.5 + space - 15 * this.dpr;
        this.partyPanel.setHandler(new Handler(this, this.onSendHandler));
        this.add([this.roomName, this.roomState, this.roomEvaluate, this.partyPanel]);
    }

    private onSendHandler(tag: string, data: any) {
        if (this.send) this.send.runWith([tag, data]);
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
    private send: Handler;
    private timeCountDown: TimerCountDown;
    constructor(scene, dpr: number) {
        super(scene);
        const width = 293 * dpr;
        const height = 237 * dpr;
        this.setSize(width, height);
        this.bg = this.scene.make.graphics(undefined, false);
        this.bg.fillStyle(0xC5EDFC, 0.66);
        this.bg.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, 4 * dpr);
        this.titlebg = this.scene.make.image({ key: UIAtlasName.room_info, frame: "room_party_status_title" });
        this.titleTex = this.scene.make.text({ text: i18n.t("room_info.partystate"), style: UIHelper.whiteStyle(dpr, 14) }).setOrigin(0.5);
        this.titlebg.y = -height * 0.5 + 30 * dpr;
        this.titleTex.y = this.titlebg.y;
        this.partybg = this.scene.make.image({ key: UIAtlasName.room_info, frame: "room_party_icon_bg" });
        this.partyIcon = this.scene.make.image({ key: UIAtlasName.room_info, frame: "room_party_icon_1" });
        this.partybg.x = -width * 0.5 + this.partybg.width * 0.5 + 15 * dpr;
        this.partybg.y = this.titlebg.y + this.titlebg.height * 0.5 + this.partybg.height * 0.5 + 25 * dpr;
        this.partyIcon.x = this.partybg.x;
        this.partyIcon.y = this.partybg.y;
        this.timeValue = new PartyTimeValue(this.scene, dpr);
        this.timeValue.x = this.timeValue.width * 0.5 - 5 * dpr;
        this.timeValue.y = -20 * dpr;
        this.cardTips = this.scene.make.text({ text: i18n.t("room_info.partycardtips"), style: UIHelper.blackStyle(dpr) }).setOrigin(0, 0.5);
        this.cardTips.x = this.timeValue.x - this.timeValue.width * 0.5 - 10 * dpr;
        this.cardTips.y = this.timeValue.y + 40 * dpr;
        this.countImg = new ImageValue(this.scene, 40 * dpr, 25 * dpr, UIAtlasName.room_info, "party_card", dpr, UIHelper.colorStyle("#1DB4E9", 14 * dpr));
        this.countImg.setLayout(1);
        this.countImg.x = this.cardTips.x + this.cardTips.width + 5 * dpr + this.countImg.width * 0.5;
        this.countImg.y = this.cardTips.y;
        this.openButton = new NineSliceButton(scene, 0, 0, 114 * dpr, 36 * dpr, UIAtlasName.uicommon, "button_g", i18n.t("room_info.openparty"), dpr, 1, UIHelper.button(dpr));
        this.openButton.y = height * 0.5 - this.openButton.height * 0.5 - 15 * dpr;
        this.openButton.on(ClickEvent.Tap, this.onOpenHandler, this);
        this.openButton.setTextStyle(UIHelper.blackStyle(dpr, 16));
        this.openButton.setFontStyle("bold");
        this.add([this.bg, this.titlebg, this.titleTex, this.partybg, this.partyIcon, this.timeValue, this.cardTips, this.countImg, this.openButton]);
    }
    public setHandler(send: Handler) {
        this.send = send;
    }
    public setPartyData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS) {
        if (data.created) {
            this.openButton.setFrameNormal("butt_gray", "butt_gray");
            this.openButton.disInteractive();
            this.partyIcon.setFrame("room_party_icon");
            if (!this.timeCountDown) this.timeCountDown = new TimerCountDown(new Handler(this, (time: number) => {
                this.timeValue.setTimeValue(time * 1000);
            }));
            this.timeCountDown.executeTime(data.expired);
            this.openButton.setTextColor("#ffffff");
        } else {
            this.openButton.setFrameNormal("button_g", "button_g");
            this.openButton.setInteractive();
            this.partyIcon.setFrame("room_party_icon_1");
            this.openButton.setTextColor("#000000");
            this.timeValue.setTimeValue(0);
        }
        this.countImg.setText("*" + data.ticketsCount);
    }

    public destroy() {
        super.destroy();
        if (this.timeCountDown) this.timeCountDown.clear();
    }
    private onOpenHandler() {
        if (this.send) this.send.runWith(["open"]);
    }
}
class PartyTimeValue extends Phaser.GameObjects.Container {
    private timeImg: TimeImageValue[] = [];
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.create();
    }
    public setTimeValue(time: number) {
        const day = Math.floor(time / 86400000);
        const hour = Math.floor(time / 3600000) % 24;
        const minute = Math.floor(time / 60000) % 60;
        const second = Math.floor(time / 1000) % 60;
        let timeTex = hour >= 10 ? `${hour}` : `0${hour}`;
        timeTex += minute >= 10 ? `${minute}` : `0${minute}`;
        timeTex += second >= 10 ? `${second}` : `0${second}`;
        for (let i = 0; i < timeTex.length; i++) {
            this.timeImg[i].setValue(timeTex[i]);
        }
    }
    private create() {
        let width: number = 0;
        let height: number = 0;
        for (let i = 0; i < 6; i++) {
            const timeImg = new TimeImageValue(this.scene, this.dpr);
            this.timeImg.push(timeImg);
            timeImg.x = width;
            height = timeImg.height;
            if (i === 1 || i === 3) {
                width += timeImg.width * 0.5;
                const tips = this.scene.make.text({ text: " : ", style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0.5);
                tips.x = width + tips.width * 0.5;
                width += timeImg.width * 0.5 + tips.width * 0.5 + tips.width * 0.5;
                this.add([timeImg, tips]);
            } else {
                width += timeImg.width + 2 * this.dpr;
                this.add(timeImg);
            }
        }
        for (const img of <any>this.list) {
            img.x -= width * 0.5;
        }
        this.setSize(width, height);
    }
}
class TimeImageValue extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private value: Phaser.GameObjects.Text;
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.bg = this.scene.make.image({ key: UIAtlasName.room_info, frame: "room_party_countdown" });
        this.value = this.scene.make.text({ text: 0, style: UIHelper.whiteStyle(dpr, 16) }).setOrigin(0.5);
        this.value.setFontStyle("bold");
        this.add([this.bg, this.value]);
        this.setSize(this.bg.width, this.bg.height);
    }
    public setValue(value: string) {
        this.value.text = value;
    }
}
