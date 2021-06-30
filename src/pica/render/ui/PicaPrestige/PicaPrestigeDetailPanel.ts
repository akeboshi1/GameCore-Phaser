import { BBCodeText, Button, ClickEvent, GameGridTable, GameScroller } from "apowophaserui";
import { UIAtlasName } from "../../../res";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { BackgroundText, ImageBBCodeValue, ImageValue } from "../Components";
import { DynamicImage, ThreeSliceButton } from "gamecoreRender";
import { IFameLevel, IPermission } from "picaStructure";
export class PicaPrestigeDetailPanel extends Phaser.GameObjects.Container {
    private content: Phaser.GameObjects.Container;
    private bottom: Phaser.GameObjects.Container;
    private topLabel: BackgroundText;
    private topScroll: GameScroller;
    private bottomLabel: BackgroundText;
    private prestigeText: BBCodeText;
    private bottomGrid: GameGridTable;
    private bottomGraphic: Phaser.GameObjects.Graphics;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
    }
    resize(width: number, height: number) {
        this.setSize(width, height);
        this.content.y = -this.height * 0.5 + this.content.height * 0.5;
        this.adjuestBottomSize();
        this.topScroll.refreshMask();
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    public setPrestigeData(datas: IFameLevel[]) {
        const items = <PrestigePrivilegeItem[]>this.topScroll.getItemList();
        for (let i = 0; i < datas.length; i++) {
            let item: PrestigePrivilegeItem;
            if (i < items.length) {
                item = items[i];
            } else {
                item = new PrestigePrivilegeItem(this.scene, this.dpr, this.zoom);
                item.setHandler(this.send);
                this.topScroll.addItem(item);
            }
            item.setItemData(datas[i]);
        }
        this.topScroll.Sort();
        this.setPrestigaValues(888888);
    }

    public setPrestigaValues(value: number) {
        this.prestigeText.text = i18n.t("prestige.value") + `[color=#6255DE][size=${16 * this.dpr}][b]${value}[/b][/size][/color]`;
    }

    public setPrestigaTips(datas: any[]) {
        this.bottomGrid.setItems(datas);
        this.bottomGrid.setT(0);
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }
    protected init() {
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.width, 256 * this.dpr);
        this.topLabel = new BackgroundText(this.scene, UIAtlasName.prestige, "prestige_title_bg", i18n.t("prestige.privileges"), this.dpr);
        this.topLabel.setColor("#6255DE");
        this.topLabel.setFontStyle("bold");
        this.topLabel.y = -this.content.height * 0.5 + this.topLabel.height * 0.5;
        this.topScroll = new GameScroller(this.scene, {
            x: 0,
            y: 10 * this.dpr,
            width: this.width,
            height: 188 * this.dpr,
            zoom: this.zoom,
            align: 2,
            orientation: 1,
            dpr: this.dpr,
            space: 4 * this.dpr,
            padding: { left: 10 * this.dpr, right: 10 * this.dpr },
            selfevent: true,
            cellupCallBack: (obj) => {
                this.onScrollHandler(obj);
            }
        });
        this.content.add([this.topLabel, this.topScroll]);
        this.bottom = this.scene.make.container(undefined, false);
        this.bottom.setSize(this.width, 291 * this.dpr);
        this.bottomLabel = new BackgroundText(this.scene, UIAtlasName.prestige, "prestige_title_bg", i18n.t("prestige.growup"), this.dpr);
        this.bottomLabel.setFontStyle("bold");
        this.bottomLabel.setColor("#6255DE");
        this.bottomLabel.y = -this.bottom.height * 0.5 + this.bottomLabel.height * 0.5;
        this.prestigeText = new BBCodeText(this.scene, 0, 0, "", {
            color: "#333333",
            fontSize: 11 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            lineSpacing: 5 * this.dpr,
            padding: {
                top: 2 * this.dpr
            }
        }).setOrigin(0.5);
        this.prestigeText.y = -this.bottomLabel.y + this.bottomLabel.height * 0.5 + 13 * this.dpr;
        this.bottomGrid = this.createGrideTable(0, 32 * this.dpr, this.width, 220 * this.dpr, 310 * this.dpr, 36 * this.dpr);
        this.bottomGraphic = this.scene.make.graphics(undefined, false);
        this.bottom.add([this.bottomGraphic, this.bottomLabel, this.prestigeText, this.bottomGrid]);
        this.add([this.content, this.bottom]);
        this.resize(this.width, this.height);
    }

    private adjuestBottomSize() {
        const width = this.width;
        const height = this.height;
        const bottomHeight = height - this.content.height;
        this.bottom.setSize(width, bottomHeight);
        this.bottom.y = height * 0.5 - bottomHeight * 0.5 - 10 * this.dpr;
        this.bottomLabel.y = -bottomHeight * 0.5 + this.bottomLabel.height * 0.5 + 15 * this.dpr;
        this.prestigeText.y = this.bottomLabel.y + this.bottomLabel.height * 0.5 + 20 * this.dpr;
        const gridWidth = 334 * this.dpr, gridHeight = bottomHeight - 80 * this.dpr;
        this.bottomGrid.setSize(gridWidth, gridHeight);
        this.bottomGrid.y = bottomHeight * 0.5 - gridHeight * 0.5;
        this.bottomGrid.resetMask();
        this.bottomGraphic.fillStyle(0xffffff, 0.3);
        this.bottomGraphic.fillRect(-gridWidth * 0.5, -gridHeight * 0.5, gridWidth, gridHeight);
        this.bottomGraphic.y = this.bottomGrid.y;

    }
    private onScrollHandler(obj) {

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
                tableOY: 5 * this.dpr,
                zoom: this.zoom,
                cellPadX: 8 * this.dpr,
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PrestigeValueTipsItem(this.scene, capW, capH, this.dpr);
                }
                cellContainer.setData({ item });
                return cellContainer;
            },
        };
        const grid = new GameGridTable(this.scene, tableConfig);
        grid.layout();
        grid.on("cellTap", (cell) => {
            if (cell) {
                this.onGridSelectHandler(cell);
            }
        });
        this.add(grid);

        return grid;
    }

    private onGridSelectHandler(cell: any) {

    }

}

class PrestigePrivilegeItem extends Phaser.GameObjects.Container {
    public itemData: any;// op_client.IMarketCommodity
    private dpr: number;
    private zoom: number;
    private bg: Phaser.GameObjects.Image;
    private nameText: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private button: ThreeSliceButton;
    private tipsText: Phaser.GameObjects.Text;
    private mselect: boolean = false;
    private send: Handler;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.bg = this.scene.make.image({ key: UIAtlasName.prestige, frame: "prestige_privilege_bg1" });
        this.setSize(this.bg.width, this.bg.height);
        this.nameText = this.scene.make.text({ style: UIHelper.colorStyle("#4A87E4", 12 * dpr) }).setOrigin(0.5);
        this.nameText.setFontStyle("bold");
        this.nameText.y = -this.height * 0.5 + 20 * this.dpr;
        this.icon = new DynamicImage(scene, 0, 0, UIAtlasName.prestige, "prestige_privilege_furniture_icon");
        this.icon.y = -20 * dpr;
        this.tipsText = this.scene.make.text({ style: UIHelper.blackStyle(dpr, 11) }).setOrigin(0.5);
        this.tipsText.y = this.icon.y + this.icon.height * 0.5 + 17 * dpr;
        this.button = new ThreeSliceButton(scene, 73 * dpr, 26 * dpr, UIAtlasName.uicommon, UIHelper.threeYellowSmall, UIHelper.threeYellowSmall, i18n.t("prestige.detail"));
        this.button.setTextStyle(UIHelper.brownishStyle(dpr));
        this.button.y = this.height * 0.5 - this.button.height * 0.5 - 13 * dpr;
        this.button.on(ClickEvent.Tap, this.onButtonHandler, this);
        this.add([this.bg, this.icon, this.nameText, this.tipsText, this.button]);

    }

    public setItemData(data: IFameLevel) {
        this.itemData = data;
        const permission = data.permission;
        this.nameText.text = i18n.t("prestige.level") + data.level;
        this.tipsText.text = permission.name;
        const url = Url.getOsdRes(permission.texturePath);
        this.icon.load(url);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }
    public set select(value) {
        this.mselect = value;
        this.bg.setFrame(value ? "prestige_privilege_bg" : "prestige_privilege_bg1");
    }

    public get select() {
        return this.mselect;
    }

    private onButtonHandler() {
        if (this.send) this.send.runWith(["describle", this.itemData]);
    }
}

class PrestigeValueTipsItem extends Phaser.GameObjects.Container {
    private leftLabel: Phaser.GameObjects.Image;
    private contentText: BBCodeText;
    private valueImg: ImageBBCodeValue;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.leftLabel = this.scene.make.image({ key: UIAtlasName.prestige, frame: "prestige_grow_icon" });
        this.leftLabel.x = -width * 0.5 + 17 * dpr;
        this.contentText = new BBCodeText(scene, 0, 0, "", UIHelper.blackStyle(dpr, 12)).setOrigin(0, 0.5);
        this.contentText.x = this.leftLabel.x + 5 * dpr;
        this.valueImg = new ImageBBCodeValue(scene, 40 * dpr, 30 * dpr, UIAtlasName.prestige, "prestige_list_currency_icon", dpr);
        this.valueImg.setTextStyle(UIHelper.colorStyle("#1B59B7", dpr * 12));
        this.valueImg.setLayout(3);
        this.valueImg.x = width * 0.5 - this.valueImg.width;
        this.add([this.leftLabel, this.contentText, this.valueImg]);
    }
}
