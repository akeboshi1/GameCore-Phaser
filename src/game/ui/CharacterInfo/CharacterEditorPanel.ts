import { Font } from "../../game/core/utils/font";
import { NinePatchButton } from "../components/ninepatch.button";
import { i18n } from "../../game/core/utils/i18n";
import { InputText, Button } from "apowophaserui";
export class CharacterEditorPanel extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private inputText: InputText;
    private idText: Phaser.GameObjects.Text;
    private constellationText: Phaser.GameObjects.Text;
    private birthdayText: Phaser.GameObjects.Text;
    private cityText: Phaser.GameObjects.Text;
    private signInput: InputText;
    private dpr: number = 0;
    private key: string = "";
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        const common_key = "common_key";
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.title = this.scene.make.text({ x: 0, y: -height * 0.5 + 50 * dpr, text: this.geti18n("edit_profile"), style: { font: mfont, blod: true, color: "#ffffff", fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        const bg = this.scene.make.graphics(undefined, false);
        bg.clear();
        bg.fillStyle(0xffffff, 0.5);
        bg.fillRect(0, 0, 247 * dpr, 350 * dpr);
        bg.setPosition(-width * 0.5, -184 * dpr);
        const posx = -width * 0.5 + 9 * dpr;
        const posy = -170 * dpr;
        const offsetY = 50 * dpr;
        const nameText = this.scene.make.text({ x: posx, y: posy, style: { blod: true, color: "#0062BB", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        nameText.setText(this.geti18n("user_name") + ":");
        this.inputText = new InputText(this.scene, posx + nameText.width + 20 * dpr, posy, 162 * dpr, 27 * dpr, {
            type: "input",
            fontSize: 18 * dpr + "px",
            color: "#0062BB",
            align: "center",
            placeholder: this.geti18n("input_nickname")
        }).setOrigin(0);
        const line = this.createLine(-230 * this.dpr * 0.5, posy + 32 * this.dpr);
        this.add(bg);
        this.add([this.title, nameText, this.inputText, line]);
        this.idText = this.createText("I        D:", "", posx, posy + offsetY);
        this.constellationText = this.createText(this.geti18n("constellation") + ":", "", posx, posy + offsetY * 2);
        this.birthdayText = this.createText(this.geti18n("birthday") + ":", "", posx, posy + offsetY * 3);
        this.cityText = this.createText(this.geti18n("city") + ":", "", posx, posy + offsetY * 4);
        const signText = this.scene.make.text({ x: posx, y: posy + offsetY * 5, style: { blod: true, color: "#0062BB", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        signText.setText(this.geti18n("signature") + ":");
        this.signInput = new InputText(this.scene, posx + signText.width + 20 * dpr, posy + offsetY * 5, 162 * dpr, 76 * dpr, {
            type: "input",
            fontSize: 18 * dpr + "px",
            color: "#0062BB",
            align: "center",
            placeholder: this.geti18n("input_signature")
        }).setOrigin(0);
        this.add([signText, this.signInput]);
        const backBtn = new Button(this.scene, common_key, "back_arrow", "back_arrow");
        const saveBtn = new NinePatchButton(this.scene, 0, height * 0.5 - 40 * dpr, 174 * this.dpr, 37 * this.dpr, common_key, "yellow_btn", this.geti18n("save"), {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        saveBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#ED7814" });
        backBtn.setPosition(posx + 8 * dpr, -height * 0.5 + 50 * dpr);
        backBtn.on("Tap", this.onBackHandler, this);
        saveBtn.on("Tap", this.onSaveHandler, this);
        this.add([backBtn, saveBtn]);
    }

    public destroy() {
        if (this.inputText) this.inputText.destroy();
        if (this.signInput) this.signInput.destroy();
        super.destroy();
    }
    private createText(name: string, value: string, posx: number, posy: number) {
        const nameText = this.scene.make.text({ x: posx, y: posy, style: { blod: true, color: "#0062BB", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0);
        nameText.setText(name);
        const valueText = this.scene.make.text({ x: posx + nameText.width + 20 * this.dpr, y: posy, text: value, style: { blod: true, color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0);
        const line = this.createLine(-230 * this.dpr * 0.5, posy + 32 * this.dpr);
        this.add([nameText, valueText, line]);
        return valueText;
    }

    private geti18n(name: string) {
        return i18n.t("player_info." + name);
    }

    private createLine(posx: number, posy: number) {
        const line = this.scene.make.graphics(undefined, false);
        line.clear();
        line.fillStyle(0x0062BB, 0.6);
        line.fillRect(0, 0, 230 * this.dpr, 3);
        line.setPosition(posx, posy);
        return line;
    }

    private onBackHandler() {
        this.visible = false;
        this.emit("editorHide");
    }

    private onSaveHandler() {

    }
}
