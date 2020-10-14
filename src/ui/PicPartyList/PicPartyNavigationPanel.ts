import { Font } from "../../utils/font";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { DynamicImage } from "../components/dynamic.image";
import { Handler } from "../../Handler/Handler";
import { Url, Coin } from "../../utils/resUtil";
import { AlertView } from "../components/alert.view";
import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText, ProgressBar } from "apowophaserui";
import { ItemInfoTips } from "../tips/ItemInfoTips";
export class PicPartyNavigationPanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private signProgressPanel: SignProgressPanel;
    private itemtips: ItemInfoTips;
    private hotelBtn: Button;
    private picatownBtn: Button;
    private key: string;
    private dpr: number;
    private zoom: number;
    private sendHandler: Handler;
    private partyData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
        this.zoom = zoom;
        this.create();
    }
    create() {
        this.signProgressPanel = new SignProgressPanel(this.scene, 252 * this.dpr, 45 * this.dpr, this.key, this.dpr);
        this.signProgressPanel.y = -this.height * 0.5 + 15 * this.dpr;
        this.signProgressPanel.setHandler(new Handler(this, this.onProgressHandler));
        this.add(this.signProgressPanel);
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
        // this.signProgressPanel.visible = false;
        this.itemtips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasKey.commonKey, "tips_bg", this.dpr);
        this.itemtips.visible = false;
        this.add(this.itemtips);
        this.hotelBtn = new Button(this.scene, this.key, "hotel", "hotel", i18n.t("party.hotel"));
        this.hotelBtn.text.setOrigin(0, 1);
        this.hotelBtn.tweenScale = 0.88;
        this.hotelBtn.setTextStyle({ fontSize: 13 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#FFDE00", stroke: "#222222", strokeThickness: 2 * this.dpr });
        this.hotelBtn.setTextOffset(-this.hotelBtn.width * 0.5 + 5 * this.dpr, this.hotelBtn.height * 0.5 - 2 * this.dpr);
        this.hotelBtn.setPosition(-this.hotelBtn.width * 0.5 - 18 * this.dpr, this.signProgressPanel.y + this.signProgressPanel.height * 0.5 + this.hotelBtn.height * 0.5 + 20 * this.dpr);
        this.hotelBtn.on(String(ClickEvent.Tap), this.onHotelHandler, this);
        this.add(this.hotelBtn);
        this.picatownBtn = new Button(this.scene, this.key, "town", "town", i18n.t("party.picatown"));
        this.picatownBtn.text.setOrigin(0, 1);
        this.picatownBtn.tweenScale = 0.88;
        this.picatownBtn.setTextStyle({ fontSize: 13 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#FFDE00", stroke: "#222222", strokeThickness: 2 * this.dpr });
        this.picatownBtn.setTextOffset(-this.picatownBtn.width * 0.5 + 5 * this.dpr, this.picatownBtn.height * 0.5 - 2 * this.dpr);
        this.picatownBtn.setPosition(this.picatownBtn.width * 0.5 - 10 * this.dpr, this.hotelBtn.y);
        this.picatownBtn.on(String(ClickEvent.Tap), this.onPicatownHandler, this);
        this.add(this.picatownBtn);
        this.setSignProgress();
    }

    public refreshMask() {
        this.mGameGrid.resetMask();
    }
    public setHandler(handler: Handler) {
        this.sendHandler = handler;
    }
    public setPartyDataList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST) {
        this.partyData = content;
        this.mGameGrid.setItems(content.party);
    }

    public setSignProgress() {
        this.signProgressPanel.setProgressDatas(null);
    }
    destroy() {
        super.destroy();
    }
    private onGridTableHandler(item: PartyListItem) {
        this.onSendHandler(item.partyData);
    }
    private onHotelHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["hotel", this.partyData.hotel]);
    }
    private onPicatownHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["pictown", this.partyData.picatown]);
    }
    private onSendHandler(data: op_client.IEditModeRoom) {
        if (this.sendHandler) this.sendHandler.runWith(["partylist", data]);
    }
    private onProgressHandler() {
        if (this.sendHandler) this.sendHandler.runWith(["progress"]);
    }
    private onItemInfoTips(data: op_client.ICountablePackageItem, isdown: boolean, pos: Phaser.Geom.Point) {
        this.itemtips.visible = isdown;
        this.itemtips.x = pos.x;
        this.itemtips.y = pos.y;
        this.itemtips.setText(this.getDesText(data));
    }
    private getDesText(data: op_client.ICountablePackageItem) {
        if (!data) data = <any>{ "sellingPrice": true, tradable: false };
        let text: string = data.name + "\n";
        let source = i18n.t("common.source") + ":";
        source += data.source;
        source = `[stroke=#333333][color=#333333]${source}[/color][/stroke]`;
        text += source + "\n";
        if (data.sellingPrice) {
            let price = i18n.t("common.sold");
            price += `${Coin.getName(data.sellingPrice.coinType)} x ${data.sellingPrice.price}`;
            price = `[stroke=#333333][color=#333333]${price}[/color][/stroke]`;
            text += price + "\n";
        }
        if (!data.tradable) {
            let trade = i18n.t("furni_unlock.notrading");
            trade = `[stroke=#333333][color=#ff0000]*${trade}[/color][/stroke]`;
            text += trade;
        }
        return text;
    }
}

class PartyListItem extends Phaser.GameObjects.Container {
    public partyData: op_client.IEditModeRoom;
    private key: string;
    private dpr: number;
    private bg: NineSlicePatch;
    private partyName: Phaser.GameObjects.Text;
    private imagIcon: DynamicImage;
    private hotImageValue: ImageValue;
    private partyOwnerName: ImageValue;
    private playerCount: ImageValue;
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
        this.hotImageValue = new ImageValue(scene, 30 * dpr, 10 * dpr, key, "hot", dpr);
        this.hotImageValue.setTextStyle({ fontSize: 10 * dpr, color: "#D2691E" });
        this.hotImageValue.x = -this.width * 0.5 + this.hotImageValue.width * 0.5 + 8 * dpr;
        this.hotImageValue.y = this.height * 0.5 - this.hotImageValue.height * 0.5 - 5 * dpr;
        this.add(this.hotImageValue);
        this.partyName = scene.make.text({ x: -this.width * 0.5 + 40 * dpr, y: -this.height * 0.5 + 5 * dpr, text: "", style: { color: "#333333", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.partyName.setOrigin(0);
        this.add(this.partyName);
        this.partyOwnerName = new ImageValue(scene, 50 * dpr, 20 * dpr, key, "user", dpr);
        this.partyOwnerName.setTextStyle({ fontSize: 10 * dpr, color: "#333333" });
        this.partyOwnerName.x = this.partyName.x + this.partyOwnerName.width * 0.5;
        this.partyOwnerName.y = this.partyName.y + 25 * dpr;
        this.add(this.partyOwnerName);
        this.playerCount = new ImageValue(scene, 30 * dpr, 20 * dpr, UIAtlasKey.commonKey, "home_persons", dpr);
        this.playerCount.setTextStyle({ color: "#333333" });
        this.playerCount.x = this.width * 0.5 - 25 * dpr;
        this.add(this.playerCount);
    }
    public setPartyData(data: op_client.IEditModeRoom) {
        this.partyData = data;
        const texturepath = data.topic.display.texturePath;
        const lastindex = texturepath.lastIndexOf("/");
        const frame = texturepath.slice(lastindex + 1, texturepath.length);
        const burl = texturepath.slice(0, lastindex + 1);
        const url = Url.getOsdRes(burl + frame + `_${this.dpr}x` + ".png");
        this.imagIcon.load(url);
        this.hotImageValue.setText(data.ownerName);
        this.partyName.text = data.topic.name;
    }
}

class ImageValue extends Phaser.GameObjects.Container {
    private dpr: number;
    private icon: Phaser.GameObjects.Image;
    private value: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, dpr: number, offsetx: number = 0) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.icon = scene.make.image({ key, frame });
        this.value = scene.make.text({ x: 0, y: offsetx, text: "10", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0, 0.5);
        this.add([this.icon, this.value]);
        this.resetSize();
    }
    public setFrameValue(text: string, key: string, frame: string) {
        this.icon.setTexture(key, frame);
        this.value.text = text;
        this.resetPosition();
    }
    public setText(tex: string) {
        this.value.text = tex;
    }
    public setTextStyle(style: object) {
        this.value.setStyle(style);
    }
    public setShadow(x?: number, y?: number, color?: string, blur?: number, shadowStroke?: boolean, shadowFill?: boolean) {
        this.value.setShadow(x, y, color, blur, shadowStroke, shadowFill);
    }
    public setStroke(color: string, thickness: number) {
        this.value.setStroke(color, thickness);
    }
    public resetSize() {
        const width = this.icon.displayWidth + this.value.width;
        this.setSize(width, this.height);
        this.resetPosition();
    }
    private resetPosition() {
        this.icon.x = -this.width * 0.5 + this.icon.displayWidth * 0.5;
        this.value.x = this.icon.x + this.icon.displayWidth * 0.5 + 4 * this.dpr;
    }
}

class SignProgressPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private progress: ProgressBar;
    private progressItems: SignProgressItem[] = [];
    private receiveHandler: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        const barConfig = {
            x: 0 * dpr / 2,
            y: 15 * dpr,
            width: 251 * dpr,
            height: 11 * dpr,
            background: {
                x: 0,
                y: 0,
                width: 251 * dpr,
                height: 11 * dpr,
                config: {
                    top: 0 * dpr,
                    left: 7 * dpr,
                    right: 7 * dpr,
                    bottom: 0 * dpr,
                },
                key,
                frame: "order_progress_bottom"
            },
            bar: {
                x: 0,
                y: 0,
                width: 251 * dpr,
                height: 11 * dpr,
                config: {
                    top: 0 * dpr,
                    left: 7 * dpr,
                    right: 7 * dpr,
                    bottom: 0 * dpr,
                },
                key,
                frame: "order_progress_top"
            },
            dpr,
            textConfig: undefined
        };
        this.progress = new ProgressBar(scene, barConfig);
        this.add(this.progress);
    }

    public setProgressDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS) {
        const len = 5;// content.steps.length;
        const maxvalue = 100;
        for (let i = 0; i < len; i++) {
            // const data = content.steps[i];
            let item: SignProgressItem;
            if (i < this.progressItems.length) {
                item = this.progressItems[i];
            } else {
                item = new SignProgressItem(this.scene, 0, 0, this.key, this.dpr);
                this.add(item);
                this.progressItems.push(item);
                item.setHandler(new Handler(this, this.onReceiveHandler));
            }
            item.x = -this.width * 0.5 + this.width * (i + 1) / len - 16 * this.dpr;
            item.y = 15 * this.dpr;
            // item.setItemData(data, i, content.currentProgressValue);
            // maxvalue = data.targetValue;
        }
        //  this.progress.setProgress(content.currentProgressValue, maxvalue);
    }

    public setHandler(handler: Handler) {
        this.receiveHandler = handler;
    }
    private onReceiveHandler(index: number) {
        if (this.receiveHandler) this.receiveHandler.runWith(index);
    }
}
class SignProgressItem extends Phaser.GameObjects.Container {
    public progressData: op_client.IPKT_Progress;
    public index: number;
    private key: string;
    private dpr: number;
    private bg: Button;
    private icon: DynamicImage;
    private text: Phaser.GameObjects.Text;
    private receiveHandler: Handler;
    private finishIcon: Phaser.GameObjects.Image;
    private balckgraphic: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.bg = new Button(scene, key, "order_progress_unfinished", "order_progress_unfinished");
        this.icon = new DynamicImage(scene, 0, 0);
        this.text = scene.make.text({ x: 0, y: -this.bg.height * 0.5 - 8 * dpr, text: "10", style: { color: "#FFDE00", fontSize: 12 * dpr, bold: true, fontFamily: Font.DEFULT_FONT } });
        this.text.setStroke("#905C06", 4);
        this.text.setOrigin(0.5);
        this.finishIcon = scene.make.image({ key, frame: "order_progress_ok" });
        this.balckgraphic = scene.make.graphics(undefined, false);
        this.balckgraphic.clear();
        this.balckgraphic.fillStyle(0, 0.5);
        this.balckgraphic.fillCircle(0, 0, 16 * dpr);
        this.add([this.bg, this.icon, this.text, this.balckgraphic, this.finishIcon]);
        this.finishIcon.visible = false;
    }

    public setItemData(data: op_client.IPKT_Progress, index: number, curvalue: number) {
        this.progressData = data;
        this.index = index;
        this.text.text = data.targetValue + "";
        if (data.rewards) {
            const url = Url.getOsdRes(data.rewards[0].display.texturePath);
            this.icon.load(url, this, () => {
                this.icon.scale = 1;
                this.icon.scaleY = 29 * this.dpr / this.icon.displayHeight;
                this.icon.scaleX = this.icon.scaleY;
            });
        }
        this.finishIcon.visible = false;
        this.balckgraphic.visible = false;
        if (data.targetValue < curvalue) {
            this.bg.setFrameNormal("order_progress_finished", "order_progress_finished");
            if (!data.received)
                this.bg.on(String(ClickEvent.Tap), this.onReceiveHandler, this);
            else {
                this.finishIcon.visible = true;
                this.balckgraphic.visible = true;
                this.bg.off(String(ClickEvent.Tap), this.onReceiveHandler, this);
            }
        } else {
            this.bg.setFrameNormal("order_progress_unfinished", "order_progress_unfinished");
            this.bg.off(String(ClickEvent.Tap), this.onReceiveHandler, this);
        }

    }

    public setHandler(receive: Handler) {
        this.receiveHandler = receive;
    }

    private onReceiveHandler() {
        if (this.receiveHandler) this.receiveHandler.runWith(this.index);
    }
}
