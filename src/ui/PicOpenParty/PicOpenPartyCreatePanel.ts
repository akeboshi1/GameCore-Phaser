import { ClickEvent, GameGridTable, GameSlider, InputText, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { i18n } from "../../i18n";
import { Font } from "../../utils/font";
import { DynamicImage } from "../components/dynamic.image";
import { UIAtlasKey } from "../ui.atals.name";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { Url } from "../../utils/resUtil";
import { log, Logger } from "../../utils/log";
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
    private overageTitle: Phaser.GameObjects.Text;
    private overageValue: Phaser.GameObjects.Text;
    private openBtn: NineSliceButton;
    private ownerTicketCount: number = 0;
    private curPartyData: op_pkt_def.IPKT_Property;
    private curSelectItem: PicPartyThemeItem;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number) {
        super(scene, x, y);
        this.key = key;
        this.dpr = dpr;
        this.setSize(width, height);
        this.create();
    }

    public resize() {
        if (this.gamegride) this.gamegride.resetMask();
    }

    public hide() {
        this.changeInputState(false);
    }

    public show() {
        this.changeInputState(true);
    }

    public setPartyData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS, username: string) {
        this.setPartyInfoType(true);
        this.mNameInput.text = i18n.t("party.defaultname", { name: username });
        this.describleInput.text = i18n.t("party.describletitle");
        const timeticket = content.ticketsCount;
        const topic = content.topics;
        this.timeSlider.setValue(0, 0, 1);
        this.ownerTicketCount = timeticket;
        this.partyTimevalue.text = `*${timeticket}`;
        this.gamegride.setItems(topic);
        const cell = this.gamegride.getCell(0);
        if (cell && cell.container) {
            this.onGridTableHandler(cell.container);
        }
    }
    // "modifyname": "修改名称",
    // "modifytheme": "修改主题",
    // "modifydescrible": "修改描述",
    // "overagetime": "当前剩余时长",
    // "suppletime": "补充时长"
    private setPartyInfoType(create: boolean) {
        if (create) {
            this.partyNameTitle.text = i18n.t("party.partyname");
            this.partyThemeTitle.text = i18n.t("party.partytheme");
            this.describleTitle.text = i18n.t("party.partydescrible");
            this.partyTimeLable.text = i18n.t("party.partycardlabel");
            this.overageTitle.visible = false;
            this.overageValue.visible = false;
            this.partyTimeTitle.y = this.describleTitle.y + 80 * this.dpr;
            this.timeSlider.y = this.partyTimeTitle.y;
        } else {
            this.partyNameTitle.text = i18n.t("party.modifyname");
            this.partyThemeTitle.text = i18n.t("party.modifytheme");
            this.describleTitle.text = i18n.t("party.modifydescrible");
            this.partyTimeLable.text = i18n.t("party.suppletime");
            this.overageTitle.visible = true;
            this.overageValue.visible = true;
            this.partyTimeTitle.y = this.overageValue.y + 80 * this.dpr;
            this.timeSlider.y = this.partyTimeTitle.y;
        }
        this.partyTimeLable.y = this.partyTimeTitle.y + 80 * this.dpr;
        this.partyCardImage.y = this.partyTimeLable.y;
        this.partyTimevalue.y = this.partyTimeLable.y;
    }
    private changeInputState(visible: boolean) {
        this.visible = visible;
        this.describleInput.visible = visible;
        (<HTMLTextAreaElement>(this.describleInput.node)).style.display = visible ? "true" : "none";
        this.mNameInput.visible = visible;
        (<HTMLTextAreaElement>(this.mNameInput.node)).style.display = visible ? "true" : "none";
        if (visible)
            this.openBtn.on(String(ClickEvent.Tap), this.onOpenPartyHandler, this);
        else this.openBtn.off(String(ClickEvent.Tap), this.onOpenPartyHandler, this);
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
                const item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicPartyThemeItem(this.scene, 65 * this.dpr, 70 * this.dpr, this.key, this.dpr);
                }
                cellContainer.setThemeData(item);
                if (this.curPartyData && this.curPartyData.id === item.id) {
                    cellContainer.select = true;
                } else cellContainer.select = false;
                return cellContainer;
            },
        };
        this.gamegride = new GameGridTable(this.scene, tableConfig);
        this.gamegride.layout();
        this.gamegride.on("cellTap", this.onGridTableHandler, this);
        this.add(this.gamegride);

        this.describleTitle = this.scene.make.text({ x: this.partyThemeTitle.x, y: this.partyThemeTitle.y + 60 * this.dpr, text: i18n.t("party.partydescrible"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.describleTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.describleTitle.setStroke("#000000", 2);
        this.add(this.describleTitle);
        this.describleInput = this.createInput(this.describleTitle.x + this.describleTitle.width + 5 * this.dpr, this.describleTitle.y + 10 * this.dpr, 203 * this.dpr, 52 * this.dpr, "textarea");

        this.overageTitle = this.scene.make.text({ x: this.describleTitle.x, y: this.describleTitle.y + 80 * this.dpr, text: i18n.t("party.overagetime"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.overageTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.overageTitle.setStroke("#000000", 2);
        this.add(this.overageTitle);
        this.overageValue = this.scene.make.text({ x: this.overageTitle.x + this.overageTitle.width, y: this.overageTitle.y, text: "", style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.overageValue.setOrigin(0, 0.5).setResolution(this.dpr);
        this.overageValue.setStroke("#000000", 2);
        this.add(this.overageValue);

        this.partyTimeTitle = this.scene.make.text({ x: this.overageTitle.x, y: this.overageTitle.y + 80 * this.dpr, text: i18n.t("party.partytime"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.partyTimeTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.partyTimeTitle.setStroke("#000000", 2);
        this.add(this.partyTimeTitle);
        const sliderWidth = 200 * this.dpr;
        const sliderHeight = 4 * this.dpr;
        const sliderx = this.partyTimeTitle.x + this.partyTimeTitle.width + 5 * this.dpr + sliderWidth * 0.5;
        this.createSlider(sliderx, this.partyTimeTitle.y, sliderWidth, sliderHeight);
        this.partyTimeLable = this.scene.make.text({ x: this.partyTimeTitle.x + 50 * this.dpr, y: this.partyTimeTitle.y + 60 * this.dpr, text: i18n.t("party.partycardlabel"), style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, bold: true, color: "#000000" } });
        this.partyTimeLable.setOrigin(0, 0.5).setResolution(this.dpr);
        this.add(this.partyTimeLable);
        this.partyCardImage = new DynamicImage(this.scene, 0, this.partyTimeLable.y);
        this.partyCardImage.setTexture(this.key, "party_card");
        this.partyCardImage.x = this.partyTimeLable.x + this.partyTimeLable.width + this.partyCardImage.width * 0.5;
        this.add(this.partyCardImage);
        this.partyTimevalue = this.scene.make.text({ x: this.partyCardImage.x + this.partyCardImage.width * 0.5 + 2 * this.dpr, y: this.partyCardImage.y, text: "", style: { fontFamily: Font.DEFULT_FONT, fontSize: 14 * this.dpr, bold: true, color: "#000000" } });
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
        this.itemCount = Math.floor(value * this.ownerTicketCount);
        this.itemCountText.text = this.itemCount + "";

    }

    private onOpenPartyHandler() {
        if (this.curPartyData) {
            const topic = this.curPartyData.key;
            const name = this.mNameInput.text;
            const des = this.describleInput.text;
            const ticket = this.itemCount;
            if (ticket > 0)
                this.emit("openparty", topic, name, des, ticket);
        }
    }

    private onGridTableHandler(item: PicPartyThemeItem) {
        if (this.curSelectItem) this.curSelectItem.select = false;
        item.select = true;
        this.curPartyData = item.partyData;
        this.curSelectItem = item;
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
    public partyData: op_pkt_def.IPKT_Property;
    private dpr: number;
    private icon: DynamicImage;
    private value: Phaser.GameObjects.Text;
    private selectbg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.selectbg = this.scene.make.image({ key, frame: "party_selected_bg" });
        this.icon = new DynamicImage(scene, 0, 0);
        this.icon.setTexture(key, "party_icon_1");
        this.value = scene.make.text({ x: 0, y: 0, text: "10", style: { color: "#333333", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0.5, 0);
        this.value.y = this.height * 0.5 - 10 * dpr;
        this.value.setWordWrapWidth(this.width, true);
        this.add([this.selectbg, this.icon, this.value]);
        this.selectbg.visible = false;
    }

    public setThemeData(topic: op_pkt_def.IPKT_Property) {
        this.partyData = topic;
        this.value.text = topic.name;
        const texturepath = topic.display.texturePath;
        const lastindex = texturepath.lastIndexOf("/");
        const frame = texturepath.slice(lastindex + 1, texturepath.length);
        const burl = texturepath.slice(0, lastindex + 1);
        const url = Url.getOsdRes(burl + frame + `_${this.dpr}x` + ".png");
        this.icon.load(url);
    }
    public set select(select: boolean) {
        this.selectbg.visible = select;
    }
}
