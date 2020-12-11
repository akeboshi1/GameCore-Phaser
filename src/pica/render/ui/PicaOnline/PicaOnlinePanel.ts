import { ButtonEventDispatcher, CheckboxGroup, DynamicImage, ImageValue, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ModuleName, RENDER_PEER } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { GameGridTable } from "apowophaserui";
export class PicaPartyListPanel extends PicaBasePanel {
    private content: Phaser.GameObjects.Container;
    private mBlack: Phaser.GameObjects.Graphics;
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private peopleImg: ImageValue;
    private mGameGrid: GameGridTable;
    private onlineDatas: any;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICAONLINE_NAME;
        this.atlasNames = [UIAtlasName.uicommon];
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.mBackground.clear();
        this.mBackground.fillStyle(0x01CDFF, 1);
        this.mBackground.fillRect(0, 0, this.content.width, h - this.bg.height);
        this.mBackground.x = -this.content.width * 0.5;
        this.mBackground.y = -this.content.height * 0.5 + this.bg.height;
        this.content.x = width + this.content.width * 0.5;
        this.content.y = height * 0.5;
        this.mGameGrid.resetMask();
        this.setSize(width, height);
    }

    public addListen() {
        if (!this.mInitialized) return;

    }

    public removeListen() {
        if (!this.mInitialized) return;
    }

    public destroy() {
        this.removeListen();
        super.destroy();
    }

    public setOnlineDatas(datas: any) {
        // this.onlineDatas = content;
        const arr = new Array(60);
        this.mGameGrid.setItems(arr);
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.mBlack = this.scene.make.graphics(undefined, false);
        this.mBlack.fillStyle(0, 0.66);
        this.mBlack.fillRect(0, 0, w, h);
        this.mBlack.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 295 * this.dpr;
        this.content.setSize(bgwidth, h);
        this.bg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "online_bg" });
        this.bg.displayWidth = bgwidth;
        this.bg.y = -h * 0.5 + this.bg.height * 0.5;
        this.titleTex = this.scene.make.text({ x: 0, y: 0, text: i18n.t("online.title"), style: UIHelper.whiteStyle(this.dpr, 18) });
        this.peopleImg = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, UIAtlasName.uicommon, "people_woman", this.dpr);
        this.peopleImg.setOffset(-this.dpr, 0);
        this.peopleImg.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.peopleImg.setLayout(1);
        this.peopleImg.setText("");
        const tableConfig = {
            x: 0,
            y: 60 * this.dpr,
            table: {
                width: bgwidth,
                height: this.height,
                columns: 1,
                cellWidth: bgwidth,
                cellHeight: 50 * this.dpr,
                reuseCellContainer: true,
                zoom: this.scale
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new OnlineItem(this.scene, this.key, this.dpr);
                }
                cellContainer.setPartyData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", this.onGridTableHandler, this);
        this.content.add([this.mBlack, this.mBackground, this.bg, this.titleTex, this.peopleImg, this.mGameGrid]);

        this.add(this.content);
        this.resize(0, 0);
        super.init();
    }

    private onGridTableHandler() {

    }
}
class OnlineItem extends ButtonEventDispatcher {
    public playerData: any;// op_client.IEditModeRoom
    protected key: string;
    protected dpr: number;
    private headicon: DynamicImage;
    private nameImage: ImageValue;
    private levelLabel: Phaser.GameObjects.Text;
    private vipImage: ImageValue;
    private line: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene, 0, 0);
        this.key = key;
        this.dpr = dpr;
        this.setSize(237 * dpr, 48 * dpr);
        this.headicon = new DynamicImage(this.scene, 0, 0);
        this.headicon.x = -this.width * 0.5 + 60 * this.dpr;
        this.headicon.y = 35 * this.dpr;
        this.headicon.scale = this.dpr * 2;
        this.headicon.visible = false;
        this.add(this.headicon);
        this.nameImage = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, this.key, "people_woman", this.dpr);
        this.nameImage.setOffset(-this.dpr, 0);
        this.nameImage.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.nameImage.setLayout(1);
        this.nameImage.setText("");
        this.nameImage.x = this.headicon.x + 70 * this.dpr;
        this.nameImage.y = -this.width * 0.5 + 15 * this.dpr;
        this.add(this.nameImage);
        this.levelLabel = this.scene.make.text({ x: this.nameImage.x - 8 * this.dpr, y: this.nameImage.y + 20 * this.dpr, text: "", style: UIHelper.whiteStyle(this.dpr) });
        this.levelLabel.setOrigin(0, 0.5);
        this.add(this.levelLabel);

        this.vipImage = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, this.key, "people_woman", this.dpr);
        this.vipImage.setOffset(-this.dpr, 0);
        this.vipImage.setTextStyle(UIHelper.whiteStyle(this.dpr, 14));
        this.vipImage.setLayout(1);
        this.vipImage.setText("");
        this.vipImage.x = this.levelLabel.x + 70 * this.dpr;
        this.vipImage.y = -this.width * 0.5 + 15 * this.dpr;
        this.add(this.vipImage);
        this.line = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "online_divider" });
        this.line.y = this.height * 0.5;
        this.add(this.line);

    }
    public setPlayerInfo(data: any) {// op_client.IEditModeRoom
        this.playerData = data;
        const texturepath = data.topic.display.texturePath;
        const lastindex = texturepath.lastIndexOf("/");
        const frame = texturepath.slice(lastindex + 1, texturepath.length);
        const burl = texturepath.slice(0, lastindex + 1);
        const url = Url.getOsdRes(burl + frame + `_s_${this.dpr}x` + ".png");
    }
}
