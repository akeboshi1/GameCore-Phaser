import { BBCodeText, ClickEvent, GameGridTable, GameSlider, InputText, NineSliceButton, NineSlicePatch } from "apowophaserui";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { AlertView, DynamicImage, Render, UiManager } from "gamecoreRender";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { TimerCountDown } from "picaWorker";
import { UIAtlasKey } from "picaRes";
export class PicOpenPartyCreatePanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private partyNameTitle: BBCodeText;
    private mNameInput: InputText;
    private partyThemeTitle: BBCodeText;
    private gamegride: GameGridTable;
    private describleTitle: BBCodeText;
    private describleInput: InputText;
    private partyTimeTitle: BBCodeText;
    private timeSlider: GameSlider;
    private thumb: Phaser.GameObjects.Image;
    private itemCountText: Phaser.GameObjects.Text;
    private itemCount: number = 0;
    private partyTimeLable: BBCodeText;
    private partyTimevalue: Phaser.GameObjects.Text;
    private partyCardImage: DynamicImage;
    private overageTitle: BBCodeText;
    private overageValue: Phaser.GameObjects.Text;
    private openBtn: NineSliceButton;
    private curPartyData: op_pkt_def.IPKT_Property;
    private curSelectItem: PicPartyThemeItem;
    private expiredTime: number = 0;
    private timer: TimerCountDown;
    private partyData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS;
    private zoom: number;
    private render: Render;
    constructor(private uiManager: UiManager, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(uiManager.scene, x, y);
        this.key = key;
        this.dpr = dpr;
        this.render = uiManager.render;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public resize() {
        if (this.gamegride) this.gamegride.resetMask();
    }

    public hide() {
        this.visible = false;
        this.changeInputState(false);
    }

    public show() {
        this.visible = true;
        this.changeInputState(true);
    }
    public destroy(fromScene?: boolean) {
        super.destroy(fromScene);
        if (this.timer) this.timer.clear();
    }
    public setPartyData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CREATE_PARTY_REQUIREMENTS, username: string, servertime: number) {
        this.partyData = content;
        this.setPartyInfoType(!content.created);
        const timeticket = content.ticketsCount;
        const topic = content.topics;
        this.timeSlider.setValue(0, 0, 1);
        this.partyTimevalue.text = `x${timeticket}`;
        if (content.created) {
            this.mNameInput.text = content.name;
            this.describleInput.text = content.des;
            this.setExpiredValue(content.expired, servertime);
        } else {
            this.mNameInput.text = i18n.t("party.defaultname", { name: username });
            this.describleInput.text = i18n.t("party.describletitle");
        }
        this.gamegride.setItems(topic);
        let cell: any;
        if (content.created) {
            const items = content.topics;
            let index = 0;
            for (const temp of items) {
                if (temp.key === content.topic.key) {
                    cell = temp;
                    break;
                }
                index++;
            }
            this.gamegride.setT(index / items.length);
            cell = this.gamegride.getCell(index);
        } else {
            cell = this.gamegride.getCell(0);
        }
        if (cell && cell.container) {
            this.onGridTableHandler(cell.container);
        }
    }

    private setExpiredValue(expiredTime: number, servertime: number) {
        this.expiredTime = expiredTime;
        const interval = expiredTime - servertime;
        if (interval < 0) {
            if (this.timer) this.timer.clear();
            return;
        }

        if (!this.timer) this.timer = new TimerCountDown(new Handler(this, (_interval: number, text: string) => {
            this.overageValue.text = text;
            if (_interval <= 0) {
                this.emit("querytheme");
                // if (this.timer) this.timer.clear();
            }
        }));
        this.timer.execute(interval);
    }

    private setPartyInfoType(create: boolean) {
        if (create) {
            this.partyNameTitle.text = `[b]${i18n.t("party.partyname")}[/b]`;
            this.partyThemeTitle.text = `[b]${i18n.t("party.partytheme")}[/b]`;
            this.describleTitle.text = `[b]${i18n.t("party.partydescrible")}[/b]`;
            this.partyTimeTitle.text = `[b]${i18n.t("party.partytime")}[/b]`;
            (<any>(this.overageTitle)).visible = false;
            this.overageValue.visible = false;
            this.partyTimeTitle.y = this.describleTitle.y + 70 * this.dpr;
            this.timeSlider.y = this.partyTimeTitle.y;
            this.openBtn.setText(i18n.t("party.partyopen"));
        } else {
            this.partyNameTitle.text = `[b]${i18n.t("party.modifyname")}[/b]`;
            this.partyThemeTitle.text = `[b]${i18n.t("party.modifytheme")}[/b]`;
            this.describleTitle.text = `[b]${i18n.t("party.modifydescrible")}[/b]`;
            this.partyTimeTitle.text = `[b]${i18n.t("party.suppletime")}[/b]`;
            (<any>(this.overageTitle)).visible = true;
            this.overageValue.visible = true;
            this.partyTimeTitle.y = this.overageValue.y + 45 * this.dpr;
            this.timeSlider.y = this.partyTimeTitle.y;
            this.openBtn.setText(i18n.t("common.confirm"));
        }
        this.partyTimeLable.y = this.partyTimeTitle.y + 34 * this.dpr;
        this.partyCardImage.y = this.partyTimeLable.y;
        this.partyTimevalue.y = this.partyTimeLable.y;
    }
    private changeInputState(visible: boolean) {
        // this.visible = visible;
        this.describleInput.visible = visible;
        (<HTMLTextAreaElement>(this.describleInput.node)).style.display = visible ? "true" : "none";
        this.mNameInput.visible = visible;
        (<HTMLTextAreaElement>(this.mNameInput.node)).style.display = visible ? "true" : "none";
        if (visible)
            this.openBtn.on(String(ClickEvent.Tap), this.onOpenPartyHandler, this);
        else this.openBtn.off(String(ClickEvent.Tap), this.onOpenPartyHandler, this);
    }
    private create() {
        this.partyNameTitle = new BBCodeText(this.scene, -this.width * 0.5 + 10 * this.dpr, -this.height * 0.5 + 10 * this.dpr, i18n.t("party.partyname"), { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, color: "#000000" });
        this.partyNameTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        // this.partyNameTitle.setStroke("#000000", 2);
        this.add(this.partyNameTitle);
        this.mNameInput = this.createInput(this.partyNameTitle.x + this.partyNameTitle.width + 13 * this.dpr, this.partyNameTitle.y, 190 * this.dpr, 37 * this.dpr, 13 * this.dpr);
        this.mNameInput.on("textchange", this.onTextChangeHandler, this);
        this.partyThemeTitle = new BBCodeText(this.scene, this.partyNameTitle.x, this.partyNameTitle.y + 65 * this.dpr, i18n.t("party.partytheme"), { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, color: "#000000" });
        this.partyThemeTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        //  this.partyThemeTitle.setStroke("#000000", 2);
        this.add(this.partyThemeTitle);
        const tableConfig = {
            x: 30 * this.dpr,
            y: this.partyThemeTitle.y + 7 * this.dpr,
            table: {
                width: 200 * this.dpr,
                height: 90 * this.dpr,
                columns: 1,
                cellWidth: 70 * this.dpr,
                cellHeight: 70 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom,
                padding: { left: -10 * this.dpr }
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
                if (this.curPartyData && this.curPartyData.key === item.key) {
                    cellContainer.select = true;
                    this.curSelectItem = cellContainer;
                }
                return cellContainer;
            },
        };
        this.gamegride = new GameGridTable(this.scene, tableConfig);
        this.gamegride.layout();
        this.gamegride.on("cellTap", this.onGridTableHandler, this);
        this.add(this.gamegride);

        this.describleTitle = new BBCodeText(this.scene, this.partyThemeTitle.x, this.partyThemeTitle.y + 80 * this.dpr, i18n.t("party.partydescrible"), { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, color: "#000000" });
        this.describleTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.add(this.describleTitle);
        this.describleInput = this.createInput(this.describleTitle.x + this.describleTitle.width + 13 * this.dpr, this.describleTitle.y + 10 * this.dpr, 190 * this.dpr, 52 * this.dpr, 12 * this.dpr, "textarea");

        this.overageTitle = new BBCodeText(this.scene, this.describleTitle.x, this.describleTitle.y + 65 * this.dpr, `[b]${i18n.t("party.overagetime")}[/b]`, { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, color: "#000000" });
        this.overageTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.add(this.overageTitle);
        this.overageValue = this.scene.make.text({ x: this.overageTitle.x + this.overageTitle.width + 30 * this.dpr, y: this.overageTitle.y, text: "", style: { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, color: "#333333" } });
        this.overageValue.setOrigin(0, 0.5).setResolution(this.dpr);
        this.add(this.overageValue);

        this.partyTimeTitle = new BBCodeText(this.scene, this.overageTitle.x, this.overageTitle.y + 50 * this.dpr, i18n.t("party.partytime"), { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, color: "#000000" });
        this.partyTimeTitle.setOrigin(0, 0.5).setResolution(this.dpr);
        this.add(this.partyTimeTitle);
        const sliderWidth = 190 * this.dpr;
        const sliderHeight = 4 * this.dpr;
        const sliderx = this.partyTimeTitle.x + this.partyTimeTitle.width + 10 * this.dpr + sliderWidth * 0.5;
        this.createSlider(sliderx, this.partyTimeTitle.y, sliderWidth, sliderHeight);
        this.partyTimeLable = new BBCodeText(this.scene, this.partyTimeTitle.x + 50 * this.dpr, this.partyTimeTitle.y + 40 * this.dpr, i18n.t("party.partycardlabel"), { fontFamily: Font.DEFULT_FONT, fontSize: 11 * this.dpr, color: "#000000" });
        this.partyTimeLable.setOrigin(0, 0.5).setResolution(this.dpr);
        this.partyTimeLable.x = -this.partyTimeLable.width * 0.5 - 20 * this.dpr;
        this.add(this.partyTimeLable);
        this.partyCardImage = new DynamicImage(this.scene, 0, this.partyTimeLable.y);
        this.partyCardImage.setTexture(this.key, "party_card");
        this.partyCardImage.x = this.partyTimeLable.x + this.partyTimeLable.width + this.partyCardImage.width * 0.5;
        this.add(this.partyCardImage);
        this.partyTimevalue = this.scene.make.text({ x: this.partyCardImage.x + this.partyCardImage.width * 0.5 + 2 * this.dpr, y: this.partyCardImage.y, text: "", style: { fontFamily: Font.DEFULT_FONT, fontSize: 14 * this.dpr, color: "#000000" } });
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
            fontFamily: Font.DEFULT_FONT
        });
        this.openBtn.setFontStyle("bold");
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
        this.thumb.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.itemCountText = this.scene.make.text({
            x: 0, y: 0,
            style: {
                color: "#744803",
                fontSize: 12 * this.dpr,
                fontFamily: Font.DEFULT_FONT
            }
        }, false).setFontStyle("bold").setOrigin(0.5);
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
        const count = this.partyData ? this.partyData.ticketsCount : 0;
        this.itemCountText.x = this.thumb.x;
        this.itemCount = Math.ceil(value * count);
        if (this.itemCount > count) this.itemCount = count;
        this.itemCountText.text = this.itemCount + "";

    }
    private onTextChangeHandler() {
        const width = 170 * this.dpr;
        const len = this.mNameInput.text.length;
        this.mNameInput.text = UIHelper.spliceText(width, this.mNameInput.text, 13 * this.dpr, this.scene);
    }
    private onOpenPartyHandler() {
        if (this.curPartyData) {
            const topic = this.curPartyData.key;
            const name = this.mNameInput.text;
            const des = this.describleInput.text;
            const ticket = this.itemCount;
            const created = this.partyData.created;
            if (ticket > 0) {
                (<HTMLTextAreaElement>(this.describleInput.node)).style.display = "none";
                this.describleInput.visible = false;
                new AlertView(this.uiManager).show({
                    title: i18n.t("main_ui.party"),
                    text: !created ? i18n.t("party.openconfirm", { count: ticket }) : i18n.t("party.modifyconfirm", { count: ticket }),
                    oy: 302 * this.dpr * this.render.uiScale,
                    callback: () => {
                        this.emit("openparty", topic, name, des, ticket, created);
                    },
                    cancelback: () => {
                        (<HTMLTextAreaElement>(this.describleInput.node)).style.display = "true";
                        this.describleInput.visible = true;
                    }
                });
            } else {
                if (created) {
                    this.emit("openparty", topic, name, des, ticket, created);
                } else {
                    this.emit("showtips", "PicaNotice", i18n.t("party.ticketinsuff"));
                }
            }
        }
    }

    private onGridTableHandler(item: PicPartyThemeItem) {
        if (this.curSelectItem) this.curSelectItem.select = false;
        item.select = true;
        this.curPartyData = item.partyData;
        this.curSelectItem = item;
    }
    private createInput(x: number, y: number, width: number, height: number, font: number, type: string = "text") {
        const mblackbg = this.scene.make.graphics(undefined, false);
        mblackbg.fillStyle(0xA4EFF3, 0.66);
        mblackbg.fillRoundedRect(0, -height * 0.5, width, height, 6 * this.dpr);
        mblackbg.setPosition(x, y);
        this.add(mblackbg);
        const input = new InputText(this.scene, x + width * 0.5 + 8 * this.dpr, y, width, height - 10 * this.dpr, {
            type,
            placeholder: i18n.t("party.partydescrible"),
            color: "#055C62",
            fontSize: font + "px"
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
        this.selectbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.icon = new DynamicImage(scene, 0, 0);
        this.icon.setTexture(key, "party_icon_1");
        this.value = scene.make.text({ x: 0, y: 0, text: "10", style: { color: "#333333", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0.5, 0);
        this.value.y = this.height * 0.5 - 7 * dpr;
        this.value.setWordWrapWidth(this.width, true);
        this.add([this.selectbg, this.icon, this.value]);
        this.selectbg.visible = false;
    }

    public setThemeData(topic: op_pkt_def.IPKT_Property) {
        this.selectbg.visible = false;
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
