import { BBCodeText, Button, ClickEvent, NineSliceButton } from "apowophaserui";
import { InputField } from "gamecoreRender";
import { ImageValue } from "picaRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";

export class RoomBaseAttribute extends Phaser.GameObjects.Container {
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
    public setHandler(send: Handler) {
        this.send = send;
    }
    public setAttributeData(data: any) {

    }
}
export class RoomNameAttribute extends RoomBaseAttribute {
    private mNameInput: InputField;
    private saveBtn: Button;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number, type: string = "text", placeholder = "") {
        super(scene, width, height, dpr, zoom);
        this.title.text = i18n.t("room_info.roomname");
        const inputWidth = 190 * dpr, inputHeight = 34 * dpr;
        const inputX = this.title.x + this.title.width + 13 * dpr;
        this.mNameInput = this.createInput(inputX, 0, inputWidth, inputHeight, 14 * this.dpr, type, placeholder);
        //  this.mNameInput.on("textchange", this.onTextChangeHandler, this);
        this.mNameInput.on("blur", this.onTextChangeHandler, this);
        this.saveBtn = new Button(this.scene, UIAtlasName.room_info, "room_name_edit");
        this.saveBtn.tweenEnable = true;
        this.saveBtn["setInteractiveSize"](50 * dpr, 50 * dpr);
        this.saveBtn.on(ClickEvent.Tap, this.onSaveHandler, this);
        this.saveBtn.x = inputX + inputWidth - 20 * dpr;
        this.add(this.saveBtn);
    }

    public hide() {
        this.visible = false;
        this.changeInputState(false);
    }

    public show() {
        this.visible = true;
        this.changeInputState(true);
    }

    setAttributeData(name: string) {
        this.mNameInput.setText(name);
    }
    private createInput(x: number, y: number, width: number, height: number, font: number, type: string = "text", placeholder = "") {
        const mblackbg = this.scene.make.graphics(undefined, false);
        mblackbg.fillStyle(0xA4EFF3, 1);
        mblackbg.fillRoundedRect(0, -height * 0.5, width, height, 2 * this.dpr);
        mblackbg.setPosition(x, y);
        this.add(mblackbg);
        const input = new InputField(this.scene, x + width * 0.5 - 10 * this.dpr, y, width - 40 * this.dpr, height, {
            type,
            placeholder,
            color: "#000000",
            fontSize: font + "px",
            style: {}
        });
        this.add(input);
        return input;
    }
    private onTextChangeHandler() {
        const width = 70 * this.dpr;
        this.mNameInput.text = UIHelper.spliceText(width, this.mNameInput.text, 13 * this.dpr, this.scene);
    }
    private changeInputState(visible: boolean) {
        // this.visible = visible;
        this.mNameInput.visible = visible;
        (<HTMLTextAreaElement>(this.mNameInput.node)).style.display = visible ? "true" : "none";
        this.mNameInput.visible = visible;
        (<HTMLTextAreaElement>(this.mNameInput.node)).style.display = visible ? "true" : "none";
    }
    private onSaveHandler() {
        const text = this.mNameInput.text;
        if (this.send) this.send.runWith(["name", text]);
    }
    get text() {
        return this.mNameInput.text;
    }
}
export class RoomStateAttribute extends RoomBaseAttribute {
    private tipImag: Phaser.GameObjects.Image;
    private tipTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, width, height, dpr, zoom);
        this.title.text = i18n.t("room_info.roomstate");
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
export class RoomEvaluateAttribute extends RoomBaseAttribute {
    private tipTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, width, height, dpr, zoom);
        this.title.text = i18n.t("room_info.roomevaluate");
        this.tipTex = this.scene.make.text({ text: i18n.t("room_info.commontips"), style: UIHelper.colorStyle("#1DB4E9", dpr * 14) }).setOrigin(0, 0.5);
        this.tipTex.x = this.title.x + this.title.width + this.offset;
        this.add([this.tipTex]);
    }
    public setAttributeData(value: number) {
        this.tipTex.text = value + "";
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
