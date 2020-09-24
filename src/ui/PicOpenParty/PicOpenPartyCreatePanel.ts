import { ClickEvent, GameGridTable, GameSlider, InputText, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { i18n } from "../../i18n";
import { Font } from "../../utils/font";
import { DynamicImage } from "../components/dynamic.image";
import { UIAtlasKey } from "../ui.atals.name";
export class PicOpenPartyCreatePanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private partyNameTitle: Phaser.GameObjects.Text;
    private mNameInput: InputText;
    private partyThemeTitle: Phaser.GameObjects.Text;
    private gamegride: GameGridTable;
    private describleTitle: Phaser.GameObjects.Text;
    private describleInput: InputText;
    private partyTimeTitle: Phaser.GameObjects.Text;
    private timeSlider: GameSlider;
    private thumb: Phaser.GameObjects.Image;
    private itemCountText: Phaser.GameObjects.Text;
    private itemCount: number = 0;
    private partyTimeLable: Phaser.GameObjects.Text;
    private partyTimevalue: Phaser.GameObjects.Text;
    private partyCardImage: DynamicImage;
    private openBtn: NineSliceButton;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.key = key;
        this.dpr = dpr;
        this.setSize(width, height);
        this.create();
        this.setPartyData();
    }

    public resize() {
        if (this.gamegride) this.gamegride.resetMask();
    }

    public hide() {
        this.visible = false;
        this.describleInput.visible = false;
        (<HTMLTextAreaElement>(this.describleInput.node)).style.display = "none";
        this.mNameInput.visible = false;
        (<HTMLTextAreaElement>(this.mNameInput.node)).style.display = "none";
        this.openBtn.off(String(ClickEvent.Tap), this.onOpenPartyHandler, this);
    }

    public show() {
        this.visible = true;
        this.describleInput.visible = true;
        (<HTMLTextAreaElement>(this.describleInput.node)).style.display = "true";
        this.mNameInput.visible = true;
        (<HTMLTextAreaElement>(this.mNameInput.node)).style.display = "true";
        this.openBtn.on(String(ClickEvent.Tap), this.onOpenPartyHandler, this);
    }

    public setPartyData() {
        this.timeSlider.setValue(50, 0, 100);
        this.gamegride.setItems(new Array(60));
    }
    private create() {
        this.partyNameTitle = this.scene.make.text({ x: -this.width * 0.5 + 10 * this.dpr, y: -this.height * 0.5 + 20 * this.dpr, text: i18n.t("party.partyname"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.partyNameTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.partyNameTitle.setStroke("#000000", 2);
        this.add(this.partyNameTitle);
        this.mNameInput = this.createInput(this.partyNameTitle.x + this.partyNameTitle.width + 5 * this.dpr, this.partyNameTitle.y, 203 * this.dpr, 37 * this.dpr);

        this.partyThemeTitle = this.scene.make.text({ x: this.partyNameTitle.x, y: this.partyNameTitle.y + 60 * this.dpr, text: i18n.t("party.partytheme"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.partyThemeTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.partyThemeTitle.setStroke("#000000", 2);
        this.add(this.partyThemeTitle);
        const tableConfig = {
            x: 20 * this.dpr,
            y: this.partyThemeTitle.y,
            table: {
                width: 207 * this.dpr,
                height: 90 * this.dpr,
                columns: 1,
                cellWidth: 70 * this.dpr,
                cellHeight: 70 * this.dpr,
                reuseCellContainer: true,
                zoom: this.scale
            },
            scrollMode: 1,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicPartyThemeItem(this.scene, 65 * this.dpr, 70 * this.dpr, this.key, this.dpr);
                }
                cellContainer.setThemeData();
                return cellContainer;
            },
        };
        this.gamegride = new GameGridTable(this.scene, tableConfig);
        this.gamegride.layout();
        this.add(this.gamegride);

        this.describleTitle = this.scene.make.text({ x: this.partyThemeTitle.x, y: this.partyThemeTitle.y + 60 * this.dpr, text: i18n.t("party.partydescrible"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.describleTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.describleTitle.setStroke("#000000", 2);
        this.add(this.describleTitle);
        this.describleInput = this.createInput(this.describleTitle.x + this.describleTitle.width + 5 * this.dpr, this.describleTitle.y + 10 * this.dpr, 203 * this.dpr, 52 * this.dpr, "textarea");
        this.partyTimeTitle = this.scene.make.text({ x: this.describleTitle.x, y: this.describleTitle.y + 80 * this.dpr, text: i18n.t("party.partytime"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.partyTimeTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.partyTimeTitle.setStroke("#000000", 2);
        this.add(this.partyTimeTitle);
        const sliderWidth = 200 * this.dpr;
        const sliderHeight = 4 * this.dpr;
        const sliderx = this.partyTimeTitle.x + this.partyTimeTitle.width + 5 * this.dpr + sliderWidth * 0.5;
        this.createSlider(sliderx, this.partyTimeTitle.y, sliderWidth, sliderHeight);
        this.partyTimeLable = this.scene.make.text({ x: this.partyTimeTitle.x, y: this.partyTimeTitle.y + 60 * this.dpr, text: i18n.t("party.partycardlabel"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.partyTimeLable.setOrigin(0, 0.5).setResolution(this.dpr);
        this.add(this.partyTimeLable);
        this.partyCardImage = new DynamicImage(this.scene, this.partyTimeLable.x + this.partyTimeLable.width, this.partyTimeLable.y);
        this.add(this.partyCardImage);
        this.partyTimevalue = this.scene.make.text({ x: this.partyCardImage.x, y: this.partyCardImage.y, text: "", style: { fontFamily: Font.DEFULT_FONT, fontSize: 14 * this.dpr, bold: true, color: "#000000" } });
        this.partyTimevalue.setOrigin(0, 0.5).setResolution(this.dpr);
        this.partyTimevalue.setStroke("#000000", 2);
        this.add(this.partyTimevalue);
        this.openBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 + 2 * this.dpr, 100 * this.dpr, 33 * this.dpr, UIAtlasKey.commonKey, "yellow_btn_normal", i18n.t("party.partyopen"), this.dpr, this.scale, {
            left: 14 * this.dpr,
            top: 0 * this.dpr,
            right: 14 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.openBtn.setTextStyle({
            color: "#996600",
            fontSize: 13 * this.dpr,
            fontFamily: Font.BOLD_FONT
        });
        this.add(this.openBtn);
    }

    private createSlider(x: number, y: number, width: number, height: number) {
        const sliderbg = new NineSlicePatch(this.scene, 0, 0, 8, 7 * this.dpr, UIAtlasKey.common2Key, "slider_bg", {
            left: 3,
            top: 1,
            right: 3,
            bottom: 1
        });
        const indicator = new NineSlicePatch(this.scene, 0, 0, 8, 7 * this.dpr, UIAtlasKey.common2Key, "slider_rate", {
            left: 3,
            top: 1,
            right: 3,
            bottom: 1
        });
        this.thumb = this.scene.make.image({ key: UIAtlasKey.common2Key, frame: "block" });
        this.itemCountText = this.scene.make.text({
            x: 0, y: 0,
            style: {
                color: "#744803",
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT,
                bold: true
            }
        }, false).setOrigin(0.5);
        this.timeSlider = new GameSlider(this.scene, {
            x, y, width, height, orientation: 1,
            background: sliderbg,
            indicator,
            thumb: this.thumb,
            offsetX: this.thumb.width * 0.5,
            valuechangeCallback: this.onSliderValueHandler,
            valuechangeCallbackScope: this,
            value: 0.5
        });

        this.timeSlider.add(this.itemCountText);
        this.timeSlider.setValue(0);
        this.add(this.timeSlider);
    }
    private onSliderValueHandler(value: number) {
        this.itemCountText.x = this.thumb.x;
        this.itemCountText.text = Math.floor(value * 100) + "";
        this.itemCount = value;
    }

    private onOpenPartyHandler() {

    }

    private createInput(x: number, y: number, width: number, height: number, type: string = "text") {
        const mblackbg = this.scene.make.graphics(undefined, false);
        mblackbg.fillStyle(0xA4EFF3, 0.66);
        mblackbg.fillRect(0, -height * 0.5, width, height);
        mblackbg.setPosition(x, y);
        this.add(mblackbg);
        const input = new InputText(this.scene, x + width * 0.5, y, width, height - 10 * this.dpr, {
            type,
            placeholder: i18n.t("party.partydescrible"),
            color: "#055C62",
            fontSize: 14 * this.dpr + "px"
        });
        this.add(input);
        return input;
    }
}

class PicPartyThemeItem extends Phaser.GameObjects.Container {
    private dpr: number;
    private icon: Phaser.GameObjects.Image;
    private value: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.icon = new DynamicImage(scene, 0, 0);
        this.icon.setTexture(key, "party_icon_1");
        this.value = scene.make.text({ x: 0, y: 0, text: "10", style: { color: "#333333", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0.5, 0);
        this.value.y = this.height * 0.5 - 10 * dpr;
        this.value.setWordWrapWidth(this.width, true);
        this.add([this.icon, this.value]);
    }

    public setThemeData() {
        this.value.text = "发生四点山豆根士大夫敢死队风格去问人体温热太温柔额我让他为人体微软他";
    }
}
