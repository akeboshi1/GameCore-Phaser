import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText, ProgressBar } from "apowophaserui";
import { DynamicImage, ImageBBCodeValue, ItemInfoTips } from "gamecoreRender";
import { UIAtlasKey } from "picaRes";
import { ChineseUnit } from "structure";
import { Font, Handler, i18n, Url } from "utils";

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
    private partyData: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST
    private progressData: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
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
        this.noPartyImg = this.scene.make.image({ key: this.key, frame: "no_party" });
        this.noPartyImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.noPartyImg.y = 20 * this.dpr;
        this.add(this.noPartyImg);
        this.noPartyText = this.scene.make.text({ x: 0, y: this.noPartyImg.y + this.noPartyImg.height * 0.5 + 10 * this.dpr, text: i18n.t("party.nopartytips"), style: { color: "#AAAAAA", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.noPartyText);
        this.itemtips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasKey.common2Key, "tips_bg", this.dpr);
        this.itemtips.setVisible(false);
        this.add(this.itemtips);
        this.hotelBtn = new Button(this.scene, this.key, "hotel", "hotel", i18n.t("party.hotel"));
        this.hotelBtn.text.setOrigin(0, 1);
        this.hotelBtn.tweenScale = 0.88;
        this.hotelBtn.setTextStyle({ fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#FFDE00", stroke: "#222222", strokeThickness: 2 * this.dpr });
        this.hotelBtn.setTextOffset(-this.hotelBtn.width * 0.5 + 5 * this.dpr, this.hotelBtn.height * 0.5 - 2 * this.dpr);
        this.hotelBtn.setPosition(-this.hotelBtn.width * 0.5 - 18 * this.dpr, this.signProgressPanel.y + this.signProgressPanel.height * 0.5 + this.hotelBtn.height * 0.5 + 20 * this.dpr);
        this.hotelBtn.on(String(ClickEvent.Tap), this.onHotelHandler, this);
        this.add(this.hotelBtn);
        this.picatownBtn = new Button(this.scene, this.key, "town", "town", i18n.t("party.picatown"));
        this.picatownBtn.text.setOrigin(0, 1);
        this.picatownBtn.tweenScale = 0.88;
        this.picatownBtn.setTextStyle({ fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#FFDE00", stroke: "#222222", strokeThickness: 2 * this.dpr });
        this.picatownBtn.setTextOffset(-this.picatownBtn.width * 0.5 + 5 * this.dpr, this.picatownBtn.height * 0.5 - 2 * this.dpr);
        this.picatownBtn.setPosition(this.picatownBtn.width * 0.5 - 10 * this.dpr, this.hotelBtn.y);
        this.picatownBtn.on(String(ClickEvent.Tap), this.onPicatownHandler, this);
        this.add(this.picatownBtn);
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

    public setSignProgress(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        this.progressData = content;
        this.signProgressPanel.setProgressDatas(content);
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
    private onProgressHandler(index: number, item: SignProgressItem) {
        if (!this.progressData) return;
        const data = item.progressData;
        if (!data.received) {
            if (data.targetValue <= this.progressData.currentProgressValue) {
                this.emit("questreward", index);
            } else {
                this.itemtips.setItemData(data.rewards[0]);
                this.showItemTipsState(item);
            }
        }
    }

    private showItemTipsState(item: Phaser.GameObjects.Container, offsety: number = 0) {
        const posx = this.itemtips.x;
        const posy = this.itemtips.y;
        this.setTipsPosition(item, offsety);
        if (posx !== this.itemtips.x || posy !== this.itemtips.y) {
            this.itemtips.setVisible(true);
        } else {
            this.itemtips.setVisible(!this.itemtips.visible);
        }
    }
    private setTipsPosition(gameobject: Phaser.GameObjects.Container, offsety: number = 0) {
        let posx: number = gameobject.x;
        let posy: number = gameobject.y;
        let tempobject = <Phaser.GameObjects.Container>gameobject;
        while (tempobject.parentContainer !== this) {
            posx += tempobject.parentContainer.x;
            posy += tempobject.parentContainer.y;
            tempobject = tempobject.parentContainer;
        }
        if (posx - this.itemtips.width * 0.5 < -this.width * 0.5) {
            this.itemtips.x = this.itemtips.width * 0.5 - this.width * 0.5 + 20 * this.dpr;
        } else if (posx + this.itemtips.width * 0.5 > this.width * 0.5) {
            this.itemtips.x = this.width * 0.5 - this.itemtips.width * 0.5 - 20 * this.dpr;
        } else {
            this.itemtips.x = posx;
        }
        this.itemtips.y = posy - this.itemtips.height * 0.5 + 10 * this.dpr + offsety;
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

class SignProgressPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private progress: ProgressBar;
    private progressItems: SignProgressItem[] = [];
    private receiveHandler: Handler;
    private text: Phaser.GameObjects.Text;
    private timerID: any;

    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        const barConfig = {
            x: 0 * dpr / 2,
            y: 15 * dpr,
            width: 218 * dpr,
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
        this.text = scene.make.text({ x: this.width / 2, y: -this.height * 0.5 + 11 * dpr, text: "", style: { color: "#6666FF", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.text.setStroke("#6666FF", 1 * dpr);
        this.text.setOrigin(1, 0.5);
        this.add(this.text);
    }

    public setProgressDatas(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        const len = content.steps.length;
        let maxvalue = 100;
        const width = this.progress.width;
        let nextValue = 0;
        for (let i = 0; i < len; i++) {
            const data = content.steps[i];
            let item: SignProgressItem;
            if (i < this.progressItems.length) {
                item = this.progressItems[i];
            } else {
                item = new SignProgressItem(this.scene, 0, 0, this.key, this.dpr);
                this.add(item);
                this.progressItems.push(item);
                item.setHandler(this.receiveHandler);
            }
            item.x = -width * 0.5 + (len > 1 ? width * (i) / (len - 1) : width * 0.5);
            item.y = 15 * this.dpr;
            item.setItemData(data, i, content.currentProgressValue);
            maxvalue = data.targetValue;
            if (data.targetValue > content.currentProgressValue && nextValue === 0) {
                nextValue = data.targetValue;
            }
            // Logger.getInstance().log("current: ", content.currentProgressValue, "maxvalue: ", maxvalue);
        }
        this.progress.setProgress(content.currentProgressValue, maxvalue);

        // this.initCountDown(nextValue - content.currentProgressValue, maxvalue === nextValue);
        this.initCountDown(100, maxvalue === nextValue);
    }

    public setHandler(handler: Handler) {
        this.receiveHandler = handler;
    }

    private initCountDown(time: number, isLast: boolean) {
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = undefined;
        }
        const interval = 1000;
        const timeextu = () => {
            if (time <= 0) {
                if (this.timerID) {
                    clearInterval(this.timerID);
                    this.timerID = undefined;
                }
            }
            time--;
            // Logger.getInstance().log("timer: ", time);
            const minute = Math.floor(time / 60);
            const second = time % 60;
            const timetext = `${minute < 10 ? "0" + minute : minute + ""}:${second < 10 ? "0" + second : second + ""}`;

            this.text.text = i18n.t("party.porgresstips", { timer: timetext });
        };

        this.timerID = setInterval(() => {
            timeextu();
        }, 1000);
    }
}
class SignProgressItem extends Phaser.GameObjects.Container {
    public progressData: any;// op_client.IPKT_Progress
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
        this.text = scene.make.text({ x: 2 * dpr, y: -this.bg.height * 0.5 - 8 * dpr, text: "10", style: { color: "#FFDD00", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.text.setStroke("#905B06", 2 * dpr).setOrigin(0.5);
        this.finishIcon = scene.make.image({ key, frame: "order_progress_ok" });
        this.finishIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.balckgraphic = scene.make.graphics(undefined, false);
        this.balckgraphic.clear();
        this.balckgraphic.fillStyle(0, 0.5);
        this.balckgraphic.fillCircle(0, 0, 16 * dpr);
        this.add([this.bg, this.icon, this.text, this.balckgraphic, this.finishIcon]);
        this.finishIcon.visible = false;
    }

    public setItemData(data: any, index: number, curvalue: number) {// op_client.IPKT_Progress
        this.progressData = data;
        this.index = index;
        this.text.text = index === 0 ? i18n.t("common.sign") : i18n.t("party.onlinetime", { name: Math.floor(data.targetValue / 60) });
        this.text.visible = index === 0 ? true : false;
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
        if (data.targetValue <= curvalue) {
            this.bg.setFrameNormal("order_progress_finished", "order_progress_finished");
            if (data.received) {
                this.finishIcon.visible = true;
                this.balckgraphic.visible = true;
            }
            this.icon.clearTint();
        } else {
            this.bg.setFrameNormal("order_progress_unfinished", "order_progress_unfinished");
            this.icon.setTint(0x8B8B7A);
        }
        if (!data.received) {
            this.bg.off(String(ClickEvent.Tap), this.onReceiveHandler, this);
            this.bg.on(String(ClickEvent.Tap), this.onReceiveHandler, this);
        } else {
            this.bg.off(String(ClickEvent.Tap), this.onReceiveHandler, this);
        }

    }

    public setHandler(receive: Handler) {
        this.receiveHandler = receive;
    }

    private onReceiveHandler() {
        if (this.receiveHandler) this.receiveHandler.runWith([this.index, this]);
    }
}
