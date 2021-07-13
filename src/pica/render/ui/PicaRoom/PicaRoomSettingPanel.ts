import { op_client } from "pixelpai_proto";
import { BBCodeText, Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { Font, Handler, i18n, Tool, UIHelper } from "utils";
import { InputField, ItemInfoTips, ToggleButton } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ImageValue } from "../Components";
import { RoomNameAttribute } from "./RoomBaseAttribute";
export class PicaRoomSettingPanel extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private roomPassword: RoomNameAttribute;
    private passwordTips: Phaser.GameObjects.Text;
    private friendBtn: ToggleText;
    private friendinvite: ToggleText;
    private saveButton: Button;
    private send: Handler;
    private permission: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.setSize(width, height);
        this.createAttribute();

    }
    public setAttributeData(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        this.roomPassword.setAttributeData(data.name.msg);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    createAttribute() {
        let posy = -this.height * 0.5 + 25 * this.dpr;
        const itemHeight = 34 * this.dpr;
        const itemWidth = this.width - 10 * this.dpr;
        const space = 20 * this.dpr + itemHeight;

        this.roomPassword = new RoomNameAttribute(this.scene, itemWidth, itemHeight, this.dpr, this.zoom, "number", i18n.t("room_info.inputtips"));
        this.roomPassword.setHandler(new Handler(this, this.onPassWordHandler));
        this.roomPassword.y = posy;
        posy += space;
        this.passwordTips = this.scene.make.text({ text: i18n.t("room_info.passwordtips"), style: UIHelper.colorStyle("#A0A0A0", 10 * this.dpr) }).setOrigin(0, 0.5);
        this.passwordTips.x = -60 * this.dpr;
        this.passwordTips.y = posy + 30 * this.dpr;
        this.friendBtn = new ToggleText(this.scene, this.dpr);
        this.friendBtn.x = this.passwordTips.x;
        this.friendBtn.y = this.passwordTips.y + 30 * this.dpr;
        this.friendBtn.on(ClickEvent.Tap, this.onToggleHandler, this);
        this.friendinvite = new ToggleText(this.scene, this.dpr);
        this.friendinvite.x = this.friendBtn.x;
        this.friendinvite.y = this.friendBtn.y + 30 * this.dpr;
        this.friendinvite.on(ClickEvent.Tap, this.onToggleHandler, this);
        this.saveButton = new NineSliceButton(this.scene, 0, 0, 114 * this.dpr, 36 * this.dpr, UIAtlasName.uicommon, "button_g", i18n.t("room_info.savesetting"), this.dpr, 1, UIHelper.button(this.dpr));
        this.saveButton.y = this.height * 0.5 - this.saveButton.height * 0.5 - 100 * this.dpr;
        this.saveButton.on(ClickEvent.Tap, this.onSaveHandler, this);
        this.add([this.roomPassword, this.passwordTips, this.friendBtn, this.friendinvite, this.saveButton]);
    }
    public hide() {
        this.visible = false;
        this.roomPassword.hide();
    }

    public show() {
        this.visible = true;
        this.roomPassword.show();
    }
    private onPassWordHandler() {
        if (this.send) this.send.runWith(["password", this.roomPassword.text]);
    }
    private onSaveHandler() {
        if (this.send) this.send.runWith(["setting", {
            password: this.roomPassword.text, permission: this.permission
        }]);
    }
    private onToggleHandler(pointer, tog: ToggleButton) {

    }
}

class ToggleText extends Phaser.GameObjects.Container {
    private toggle: ToggleButton;
    private text: Phaser.GameObjects.Text;
    private dpr: number;
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.toggle = new ToggleButton(scene, 50 * dpr, 50 * dpr, UIAtlasName.room_info, "room_authority_unselected", "room_authority_selected", dpr);
        this.text = scene.make.text({ style: UIHelper.blackStyle(dpr) }).setOrigin(0, 0.5);
        this.text.x = this.toggle.width * 0.5 + 5 * dpr;
        this.add([this.toggle, this.text]);
    }

    public setText(text: string) {
        this.text.text = text;
    }
    public on(event: string, fun: Function, context: any) {
        this.toggle.on(event, fun, context);
        return this;
    }
}
