import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import InputText from "../../../lib/rexui/lib/plugins/gameobjects/inputtext/InputText";
import { Font } from "../../utils/font";
import { NinePatchButton } from "../components/ninepatch.button";
import { i18n } from "../../i18n";
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
        this.title = this.scene.make.text({ x: 0, y: -height * 0.5+42*dpr, text: "编辑资料", style: { blod: true, color: "#ffffff", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        const bg = this.scene.make.graphics(undefined, false);
        bg.clear();
        bg.fillStyle(0xffffff, 0.5);
        bg.fillRect(-width * 0.5, -height * 0.5 + 110 * dpr, 247 * dpr, 310 * dpr);
        const posx = -width * 0.5;
        const posy = height * 0.5 - 155 * dpr;
        const offsetY = 60 * dpr;
        const nameText = this.scene.make.text({ x: 0, y: posy, text: "用户名", style: { blod: true, color: "#ffffff", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.inputText = new InputText(this.scene, 0, posy, 162 * dpr, 27 * dpr, {
            type: "input",
            fontSize: 18 * dpr + "px",
            color: "#0062BB",
            align: "center",
            placeholder: "请输入昵称"
        }).setOrigin(0);
        this.add(bg);
        this.add([this.title, nameText, this.inputText]);
        this.idText = this.createText("I   D", "49855555", posx, posy + offsetY);
        this.constellationText = this.createText("星   座", "双子座", posx, posy + offsetY * 2);
        this.birthdayText = this.createText("生   日", "1998-04-24", posx, posy + offsetY * 3);
        this.cityText = this.createText("地   区", "中国·上海", posx, posy + offsetY * 4);
        const signText = this.scene.make.text({ x: 0, y: posy, text: "个性签名", style: { blod: true, color: "##0062BB", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.signInput = new InputText(this.scene, 0, posy, 162 * dpr, 76 * dpr, {
            type: "input",
            fontSize: 18 * dpr + "px",
            color: "#0062BB",
            align: "center",
            placeholder: "填写个性签名获得别人关注哦！"
        }).setOrigin(0);
        this.add([signText, this.signInput]);
        const backBtn = new Button(this.scene, common_key, "back_arrow", "back_arrow");
        const saveBtn = new NinePatchButton(this.scene, 0, 0, 112 * this.dpr, 40 * this.dpr, common_key, "yellow_btn", i18n.t("player_info.add_friend"), {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        });
        saveBtn.setTextStyle({ fontSize: 16 * this.dpr, color: "#ED7814" });
        backBtn.setPosition(posx, -height * 0.5);
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
        const nameText = this.scene.make.text({ x: posx, y: posy, text: name, style: { blod: true, color: "##0062BB", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0);
        const valueText = this.scene.make.text({ x: posx + 60 * this.dpr, y: posy, text: value, style: { blod: true, color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0);
        const line = this.scene.make.image({ x: 0, y: posy + 10 * this.dpr, key: this.key, frame: "splitters" });
        this.add([nameText, valueText, line]);
        return valueText;
    }

    private onBackHandler() {
        this.visible = false;
        this.emit("editorHide");
    }

    private onSaveHandler() {

    }
}
