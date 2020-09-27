import { Font } from "../../game/core/utils/font";
import { Handler } from "../../Handler/Handler";
import { DynamicImage } from "../Components/Dynamic.image";
import { UIAtlasKey } from "../Ui.atals.name";
import { i18n } from "../../game/core/utils/i18n";
import { op_client } from "pixelpai_proto";
import { Button, GameGridTable, ClickEvent, NineSliceButton, NineSlicePatch } from "apowophaserui";

export class PicBusinessMyStreetPanel extends Phaser.GameObjects.Container {
    private storeCountText: Phaser.GameObjects.Text;
    private newStoreBtn: Button;
    private gridtable: GameGridTable;
    private storelimitText: Phaser.GameObjects.Text;
    private dpr: number;
    private key: string;
    private zoom: number;
    private takeAllHandler: Handler;
    private goOutHandler: Handler;
    private newStoreHandler: Handler;
    private enterRoomHandler: Handler;
    private isCanNewCreate: boolean = false;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }

    public setMyStoreData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MY_STORE) {
        const datas = content.storeList;
        this.storelimitText.text = i18n.t("business_street.store_limit") + ":" + `${datas.length}/${content.storeLimit}`;
        this.gridtable.setItems(datas);
        this.isCanNewCreate = datas.length < content.storeLimit;
    }

    public setHandler(takeAll: Handler, goOut: Handler, newStore: Handler, enter: Handler) {
        this.takeAllHandler = takeAll;
        this.goOutHandler = goOut;
        this.newStoreHandler = newStore;
        this.enterRoomHandler = enter;
    }

    public resetMask() {
        this.gridtable.resetMask();
    }

    protected create() {
        const posy = -this.height * 0.5;
        const posx = -this.width * 0.5;
        const storebg = this.scene.make.image({ key: this.key, frame: "store_icon" });
        storebg.x = posx + 30 * this.dpr;
        storebg.y = posy + 6 * this.dpr;
        this.add(storebg);
        const mfont = `bold ${13 * this.dpr}px ${Font.BOLD_FONT}`;
        const storex = storebg.x + storebg.width * 0.5 + 10 * this.dpr;
        const storeTitle = this.scene.make.text({ x: storex, y: storebg.y, text: i18n.t("business_street.my_store"), style: { font: mfont, bold: true, color: "#FFC51A" } }).setOrigin(0, 0.5);
        storeTitle.setStroke("#553100", 2 * this.dpr);
        this.add(storeTitle);
        const gridWdith = this.width;
        const gridHeight = this.height - 68 * this.dpr;
        const gridY = posy + 28 * this.dpr + gridHeight * 0.5;
        this.gridtable = this.createGrideTable(0, gridY, gridWdith, gridHeight, 256 * this.dpr, 87 * this.dpr);

        this.newStoreBtn = new Button(this.scene, this.key, "new_store", "new_store");
        const btnX = -posx - this.newStoreBtn.width * 0.5 - 20 * this.dpr;
        this.newStoreBtn.setPosition(btnX, posy + 6 * this.dpr);
        this.newStoreBtn.on(String(ClickEvent.Tap), this.onNewStoreHandler, this);
        this.add(this.newStoreBtn);

        this.storelimitText = this.scene.make.text({ x: btnX - this.newStoreBtn.width * 0.5 - 10 * this.dpr, y: posy + 5 * this.dpr, text: "store limit", style: { color: "#0", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(1, 0.5);
        this.add(this.storelimitText);

        this.storeCountText = this.scene.make.text({ x: btnX + this.newStoreBtn.width * 0.5 + 20 * this.dpr, y: posy, text: "", style: { font: mfont, bold: true, color: "#FFC51A" } }).setOrigin(1, 0);
        this.add(this.storeCountText);

        const talkAllBtn = new NineSliceButton(this.scene, -60 * this.dpr, this.height * 0.5 - 7 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("business_street.takeall"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(talkAllBtn);
        talkAllBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#ffffff" });
        talkAllBtn.on(String(ClickEvent.Tap), this.onTalkAllHandler, this);
        const goOutBtn = new NineSliceButton(this.scene, 60 * this.dpr, talkAllBtn.y, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "yellow_btn", i18n.t("business_street.goout"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(goOutBtn);
        goOutBtn.on(String(ClickEvent.Tap), this.onGoOutHandler, this);
        goOutBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.BOLD_FONT, color: "#996600" });
    }

    private createGrideTable(x: number, y: number, width: number, height: number, capW: number, capH: number) {
        const tableConfig = {
            x,
            y,
            table: {
                width,
                height,
                columns: 1,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                tableOX: 19 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new MyStoreItem(this.scene, 0, 0, capW, capH, this.key, this.dpr, this.zoom);
                    cellContainer.setHandler(new Handler(this, this.onEnterHandler));
                    grid.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setStoreData(item);
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        this.add(grid);

        return grid;
    }

    private onEnterHandler(data: op_client.EditModeRoom) {
        if (this.enterRoomHandler) this.enterRoomHandler.runWith(data.roomId);
    }
    private onTalkAllHandler() {
        if (this.takeAllHandler) this.takeAllHandler.run();
    }

    private onGoOutHandler() {
        if (this.goOutHandler) this.goOutHandler.run();
    }

    private onNewStoreHandler() {
        if (!this.isCanNewCreate) return;
        if (this.newStoreHandler) this.newStoreHandler.run();
    }
}

class MyStoreItem extends Phaser.GameObjects.Container {
    public storeData: op_client.EditModeRoom;
    private key: string;
    private dpr: number;
    private storeName: Phaser.GameObjects.Text;
    private savings: Phaser.GameObjects.Text;
    private competitiveness: Phaser.GameObjects.Text;
    private turnover: Phaser.GameObjects.Text;
    private storeIcon: DynamicImage;
    private lvimgCon: Phaser.GameObjects.Container;
    private industryIcon: Phaser.GameObjects.Image;
    private enterHandler: Handler;
    private bg: NineSlicePatch;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        this.bg = new NineSlicePatch(this.scene, 0, 0, width, 80 * dpr, this.key, "resturant_bg", {
            left: 4 * this.dpr,
            top: 9 * this.dpr,
            right: 4 * this.dpr,
            bottom: 9 * this.dpr
        });
        this.add(this.bg);
        const iconbg = this.scene.make.image({ key, frame: "store_icon_bg" });
        iconbg.setPosition(posx + iconbg.width * 0.5 + 10 * dpr, 0);
        this.add(iconbg);
        this.storeIcon = new DynamicImage(this.scene, iconbg.x, 0);
        this.add(this.storeIcon);
        const storeX = iconbg.x + iconbg.width * 0.5 + 10 * dpr;
        this.storeName = this.scene.make.text({ x: storeX, y: posy + 5 * dpr, text: "Restaurant", style: { color: "#FFE11A", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.storeName);
        this.lvimgCon = this.scene.make.container(undefined, false);
        this.lvimgCon.height = 14 * dpr;
        this.lvimgCon.setPosition(storeX + 6 * dpr, this.storeName.y + this.storeName.height + this.lvimgCon.height * 0.5 + 2 * dpr);
        this.add(this.lvimgCon);
        this.savings = this.scene.make.text({ x: storeX, y: this.lvimgCon.y + this.lvimgCon.height * 0.5 + 2 * dpr, text: "Savings: 13000", style: { color: "#ffffff", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.savings);
        this.competitiveness = this.scene.make.text({ x: storeX, y: this.savings.y + this.savings.height + 2 * dpr, text: "Competitiveness: 13000", style: { color: "#ffffff", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.competitiveness);
        this.turnover = this.scene.make.text({ x: storeX, y: this.competitiveness.y + this.competitiveness.height + 2 * dpr, text: "Prosperity: +13000 / Day", style: { color: "#ffffff", fontSize: 10 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0);
        this.add(this.turnover);
        this.industryIcon = this.scene.make.image({ key: this.key, frame: "entertainment_tag" });
        this.industryIcon.x = this.width * 0.5 - this.industryIcon.width * 0.5;
        this.add(this.industryIcon);
        const enterBtn = new NineSliceButton(scene, -posx, 0, 48 * dpr, 27 * dpr, UIAtlasKey.commonKey, "yellow_btn_normal_s", i18n.t("business_street.enter"), this.dpr, zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        enterBtn.setTextStyle({ fontSize: 10 * dpr, fontFamily: Font.BOLD_FONT, color: "#996600" });
        enterBtn.x = -posx - enterBtn.width * 0.5 - 10 * dpr;
        enterBtn.on(String(ClickEvent.Tap), this.onEnterHandler, this);
        this.add(enterBtn);
    }

    public setStoreData(data: op_client.EditModeRoom) {
        const industry = data.industry;
        const storeType = data.storeType;
        this.bg.setFrame(industry + "_bg");
        this.storeIcon.setTexture(this.key, storeType + "_icon");
        this.storeName.text = data.name;
        this.lvimgCon.removeAll(true);
        this.setImageInfo(UIAtlasKey.common2Key, this.getLevelImgs(data.roomLevel.level));
        this.savings.text = i18n.t("business_street.savings") + ":" + data.savings + "";
        this.competitiveness.text = i18n.t("business_street.competitiveness") + ":" + data.competitiveness;
        this.turnover.text = i18n.t("business_street.turnover") + ":" + data.turnover;
        this.industryIcon.setFrame(industry + "_tag");
        this.storeData = data;
    }

    public setHandler(handler: Handler) {
        this.enterHandler = handler;
    }

    public setImageInfo(key: string, imgs: string[]) {
        let posX = 0;
        const space: number = 15 * this.dpr;
        for (const frame of imgs) {
            const image = this.scene.make.image({ key, frame });
            image.x = posX;
            posX += image.width * 0.5 + space;
            this.lvimgCon.add(image);
        }
    }

    private onEnterHandler() {
        if (this.enterHandler) this.enterHandler.runWith(this.storeData);
    }

    private getLevelImgs(level: number) {
        const power = 4;
        level = level ? level : 0;
        const imgs = [];
        const bearNum = Math.floor(level / Math.pow(power, 3));
        const value0 = level % Math.pow(power, 3);
        const sunNum = Math.floor(value0 / Math.pow(power, 2));
        const value1 = value0 % Math.pow(power, 2);
        const moon = Math.floor((value1) / Math.pow(power, 1));
        const value2 = value1 % Math.pow(power, 1);
        const star = value2;
        for (let i = 0; i < bearNum; i++) {
            imgs.push("bear");
        }
        for (let i = 0; i < sunNum; i++) {
            imgs.push("sun");
        }
        for (let i = 0; i < moon; i++) {
            imgs.push("moon");
        }
        for (let i = 0; i < star; i++) {
            imgs.push("star");
        }
        if (level === 0) imgs.push("star");
        return imgs;
    }
}
