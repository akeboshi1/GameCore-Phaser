import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import InputText from "../../../lib/rexui/lib/plugins/gameobjects/inputtext/InputText";
import { Font } from "../../utils/font";
export class CharacterEditorPanel extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private inputText: InputText;
    private idText: Phaser.GameObjects.Text;
    private constellationText: Phaser.GameObjects.Text;
    private birthdayText: Phaser.GameObjects.Text;
    private cityText: Phaser.GameObjects.Text;
    private signInput: InputText;
    private dpr: number = 0;
    private zoom: number = 0;
    private key: string = "";
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number = 1) {
        super(scene, x, y);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        const bg = this.scene.make.graphics(undefined, false);
        bg.clear();
        bg.fillStyle(0xffffff, 0.5);
        bg.fillRect(0, 0, this.width, this.height);
        this.title = this.scene.make.text({ x: 0, y: -height * 0.5, text: "编辑资料", style: { blod: true, color: "##0062BB", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        const posx = -width * 0.5;
        const posy = height * 0.5 - 155 * dpr * zoom;
        const offsetY = 60 * dpr * zoom;
        const nameText = this.scene.make.text({ x: 0, y: posy, text: "用户名", style: { blod: true, color: "#ffffff", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.inputText = new InputText(this.scene, 0, posy, 162 * dpr * zoom, 27 * dpr * zoom, {
            type: "input",
            fontSize: 18 * dpr + "px",
            color: "#0062BB",
            align: "center",
            placeholder: "请输入昵称"
        }).setOrigin(0);
        this.add([nameText, this.inputText]);
        this.idText = this.createText("I   D", "49855555", posx, posy + offsetY);
        this.constellationText = this.createText("星   座", "双子座", posx, posy + offsetY * 2);
        this.birthdayText = this.createText("生   日", "1998-04-24", posx, posy + offsetY * 3);
        this.cityText = this.createText("地   区", "中国·上海", posx, posy + offsetY * 4);
        const signText = this.scene.make.text({ x: 0, y: posy, text: "个性签名", style: { blod: true, color: "##0062BB", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.signInput = new InputText(this.scene, 0, posy, 162 * dpr * zoom, 76 * dpr * zoom, {
            type: "input",
            fontSize: 18 * dpr + "px",
            color: "#0062BB",
            align: "center",
            placeholder: "填写个性签名获得别人关注哦！"
        }).setOrigin(0);
        this.add([signText, this.signInput]);
        const backBtn = new Button(this.scene, key, "back_arrow", "back_arrow");
        const saveBtn = new Button(this.scene, "common_key", "yellow_btn_down", "yellow_btn_down", "保存");
        saveBtn.setTextColor("#ED7814");
        this.add([backBtn, saveBtn]);
    }

    private createText(name: string, value: string, posx: number, posy: number) {
        const nameText = this.scene.make.text({ x: posx, y: posy, text: name, style: { blod: true, color: "##0062BB", fontSize: 15 * this.dpr * this.zoom, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0);
        const valueText = this.scene.make.text({ x: posx + 60 * this.dpr * this.zoom, y: posy, text: value, style: { blod: true, color: "#ffffff", fontSize: 15 * this.dpr * this.zoom, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0);
        const line = this.scene.make.image({ x: 0, y: posy + 10 * this.dpr * this.zoom, key: this.key, frame: "splitters" });
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
