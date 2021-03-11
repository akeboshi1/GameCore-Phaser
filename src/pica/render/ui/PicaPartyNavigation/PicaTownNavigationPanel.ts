import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText, ProgressBar } from "apowophaserui";
import { DynamicImage, ImageBBCodeValue, ItemInfoTips } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { ChineseUnit } from "structure";
import { Font, Handler, i18n, Url } from "utils";

export class PicaTownNavigationPanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private hotelBtn: Button;
    private picatownBtn: Button;
    private key: string;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private partyData: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
    private noPartyImg: Phaser.GameObjects.Image;
    private noPartyText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    create() {
      
        const tableConfig = {
            x: 0,
            y: 60 * this.dpr,
            table: {
                width: 254 * this.dpr,
                height: 330 * this.dpr,
                columns: 1,
                cellWidth: 254 * this.dpr,
                cellHeight: 50 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PartyListItem(this.scene, this.key, this.dpr);
                }
                cellContainer.setPartyData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.add(this.mGameGrid);
        this.noPartyImg = this.scene.make.image({ key: this.key, frame: "no_party" });
        this.noPartyImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.noPartyImg.y = 20 * this.dpr;
        this.add(this.noPartyImg);
        this.noPartyText = this.scene.make.text({ x: 0, y: this.noPartyImg.y + this.noPartyImg.height * 0.5 + 10 * this.dpr, text: i18n.t("party.nopartytips"), style: { color: "#AAAAAA", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.noPartyText);
    }

    public refreshMask() {
        this.mGameGrid.resetMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setPartyDataList(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
        this.partyData = content;
        if (content.party.length > 0) {
            this.mGameGrid.setItems(content.party);
            this.mGameGrid.visible = true;
            this.noPartyText.visible = false;
            this.noPartyImg.visible = false;
        } else {
            this.noPartyText.visible = true;
            this.noPartyImg.visible = true;
            this.mGameGrid.visible = false;
        }
    }


    destroy() {
        super.destroy();
    }
    private onGridTableHandler(item: PartyListItem) {
        this.onSendHandler(item.partyData);
    }
    private onHotelHandler() {
        if (!this.partyData) return;
        if (this.sendHandler) this.sendHandler.runWith(["hotel", this.partyData.hotel]);
    }
    private onPicatownHandler() {
        if (!this.partyData) return;
        if (this.sendHandler) this.sendHandler.runWith(["pictown", this.partyData.picatown]);
    }
    private onSendHandler(data: any) {// op_client.IEditModeRoom
        if (this.sendHandler) this.sendHandler.runWith(["partylist", data]);
    }
}

class PartyListItem extends Phaser.GameObjects.Container {
    public partyData: any;// op_client.IEditModeRoom
    private key: string;
    private dpr: number;
    private bg: NineSlicePatch;
    private partyName: BBCodeText;
    private imagIcon: DynamicImage;
    private hotImageValue: ImageBBCodeValue;
    private partyOwnerName: ImageBBCodeValue;
    private playerCount: ImageBBCodeValue;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = new NineSlicePatch(this.scene, 0, 0, 254 * dpr, 40 * dpr, this.key, "list_bg", {
            left: 12 * this.dpr,
            top: 0 * this.dpr,
            right: 12 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.add(this.bg);
        this.setSize(this.bg.width, this.bg.height);
        this.imagIcon = new DynamicImage(scene, 0, 0);
        this.imagIcon.setTexture(this.key, "party_icon_1");
        this.imagIcon.x = -this.width * 0.5 + this.imagIcon.width * 0.5 + 8 * dpr;
        this.imagIcon.y = -this.height * 0.5 + this.imagIcon.height * 0.5 + 5 * dpr;
        this.add(this.imagIcon);
        this.hotImageValue = new ImageBBCodeValue(scene, 30 * dpr, 10 * dpr, key, "hot", dpr, {
            fontSize: 9 * dpr,
            color: "#FFDD00",
            fontFamily: Font.DEFULT_FONT,
            stroke: "#666666",
            strokeThickness: 2 * dpr,
        });
        this.hotImageValue.setOffset(-3 * dpr, 0);
        this.hotImageValue.x = -this.width * 0.5 + this.hotImageValue.width * 0.5 + 8 * dpr;
        this.hotImageValue.y = this.height * 0.5 - this.hotImageValue.height * 0.5 - 5 * dpr;
        this.add(this.hotImageValue);
        this.partyName = new BBCodeText(this.scene, -this.width * 0.5 + 45 * dpr, -this.height * 0.5 + 5 * dpr, "", {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 12 * dpr,
            color: "#333333"
        });
        this.partyName.setOrigin(0);
        this.add(this.partyName);
        this.partyOwnerName = new ImageBBCodeValue(scene, 50 * dpr, 20 * dpr, key, "user", dpr, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 11 * dpr,
            color: "#333333"
        });
        this.partyOwnerName.x = this.partyName.x + this.partyOwnerName.width * 0.5;
        this.partyOwnerName.y = this.partyName.y + 25 * dpr;
        this.add(this.partyOwnerName);
        this.playerCount = new ImageBBCodeValue(scene, 30 * dpr, 20 * dpr, UIAtlasKey.commonKey, "home_persons", dpr, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 12 * dpr,
            color: "#333333"
        });
        this.playerCount.x = this.width * 0.5 - 35 * dpr;
        this.add(this.playerCount);
    }
    public setPartyData(data: any) {// op_client.IEditModeRoom
        this.partyData = data;
        const texturepath = data.topic.display.texturePath;
        const lastindex = texturepath.lastIndexOf("/");
        const frame = texturepath.slice(lastindex + 1, texturepath.length);
        const burl = texturepath.slice(0, lastindex + 1);
        const url = Url.getOsdRes(burl + frame + `_s_${this.dpr}x` + ".png");
        this.imagIcon.load(url);
        this.hotImageValue.setText(this.getHotText(data.focus));
        this.partyName.text = `[b]${data.name}[/b]`;
        this.playerCount.setText(`[b]${data.playerCount}[/b]`);
        this.partyOwnerName.setText(data.ownerName);
    }
    private getHotText(value) {
        let text = value + "";
        if (i18n.language === "en") {
            if (text.length >= 4 && text.length < 7) {
                text = Math.floor(value / 100) / 10 + i18n.t("quantityunit.k");
            } else if (text.length >= 7) {
                text = Math.floor(value / 100000) / 10 + i18n.t("quantityunit.m");
            }
        } else {
            text = ChineseUnit.getChineseUnit(value, 1);
        }

        return `[stroke]${text} [/stroke]`;
    }
}
