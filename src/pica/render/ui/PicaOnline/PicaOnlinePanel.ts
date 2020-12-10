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
    }

    public resize(w: number, h: number) {
        const scale = this.scale;
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5 + 20 * this.dpr;
        this.setSize(width, height);
    }
    show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
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

    }

    protected preload() {
        this.addAtlas(this.key, "party/party.png", "party/party.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.mBackground.fillStyle(0, 0.66);
        this.mBackground.fillRect(0, 0, w, h);
        this.add(this.mBackground);
        this.content = this.scene.make.container(undefined, false);
        const bgwidth = 295 * this.dpr, bgheight = 490 * this.dpr;
        this.content.setSize(bgwidth, bgheight);
        // this.bg = new NineSlicePatch(this.scene, 0, 0, bgwidth, bgheight, UIAtlasKey.commonKey, "bg", {
        //     left: 20 * this.dpr,
        //     top: 20 * this.dpr,
        //     right: 20 * this.dpr,
        //     bottom: 60 * this.dpr
        // });
        this.content.add(this.bg);
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
        this.add(this.mGameGrid);

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
