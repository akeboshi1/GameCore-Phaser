import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, TimeUtils, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
export class PicaRoamPreviewPanel extends Phaser.GameObjects.Container {
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private titlebg: Phaser.GameObjects.Image;
    private titleTex: Phaser.GameObjects.Text;
    private closeBtn: Button;
    private mGameGrid: GameGridTable;
    private content: Phaser.GameObjects.Container;
    private poolsStatus: Map<string, op_client.IDRAW_POOL_STATUS[]> = new Map();
    private dpr: number;
    private zoom: number;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setInteractive();
        this.init();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.8);
        this.mBackground.fillRoundedRect(-w * 0.5, -h * 0.5, w, h);
        this.setSize(w, h);
        this.mGameGrid.resetMask();
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    init() {
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.add(this.mBackground);
        const conWdith = 340 * this.dpr;
        const conHeight = 455 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.content.setInteractive();
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasName.uicommon1, "bg", {
            left: 30 * this.dpr,
            top: 30 * this.dpr,
            bottom: 30 * this.dpr,
            right: 30 * this.dpr,
        });
        const posY = -conHeight * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon1, frame: "title" });
        this.titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titlebg.y = posY + 3 * this.dpr;
        this.titleTex = this.scene.make.text({ x: 0, y: this.titlebg.y + 2 * this.dpr, text: i18n.t("roam.previewtex"), style: UIHelper.titleYellowStyle_m(this.dpr) }).setOrigin(0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.setResolution(this.dpr);
        this.closeBtn = new Button(this.scene, UIAtlasName.uicommon, "close", "close");
        this.closeBtn.setPosition(this.bg.width * 0.5 - this.dpr * 5, -this.bg.height * 0.5 + this.dpr * 5);
        this.closeBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
        const tableConfig = {
            x: 0,
            y: 10 * this.dpr,
            table: {
                width: conWdith - 10 * this.dpr,
                height: conHeight - 50 * this.dpr,
                columns: 1,
                cellWidth: conWdith - 10 * this.dpr,
                cellHeight: 38 * this.dpr,
                reuseCellContainer: true,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new RoamPreviewItem(this.scene, this.dpr, this.zoom);
                }
                cellContainer.setRoamData(item, index % 2 === 0 ? 0 : 1);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell.roamData);
        });
        this.content.add([this.bg, this.titlebg, this.titleTex, this.closeBtn, this.mGameGrid]);
        this.resize();
        this.loadPreviewJson();
    }

    public setRoamDrawData(datas: any) {
        this.mGameGrid.setItems(datas);
        this.mGameGrid.setT(0);
    }

    private loadPreviewJson() {
        const jsonUrl = Url.getRes(`ui/roampreview/preview.json`);
        this.scene.load.json("roampreview", jsonUrl);
        this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.loadJsonComplete, this);
        this.scene.load.start();
    }

    private loadJsonComplete() {
        if (this.scene.cache.json.has("roampreview")) {
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.loadJsonComplete, this);
            const arr = this.scene.cache.json.get("roampreview");
            const tempArr = [];
            for (let i = 0; i < arr.length; i += 2) {
                const tarr = [arr[i], arr[i + 1]];
                tempArr.push(tarr);
            }
            this.setRoamDrawData(tempArr);
        }
    }
    private onSelectItemHandler(roamData: op_client.IDRAW_POOL_STATUS) {

    }
    private onCloseHandler() {
        if (this.send) this.send.runWith("close");
    }

}

class RoamPreviewItem extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    private bg: Phaser.GameObjects.Image;
    private leftItem: PreviewCellItem;
    private rightItem: PreviewCellItem;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(311 * dpr, 38 * dpr);
        this.bg = this.scene.make.image({ key: UIAtlasName.roam, frame: "roam_preview_list" });
        this.bg.displayWidth = this.width;
        this.leftItem = new PreviewCellItem(this.scene, 155 * dpr, 38 * dpr, dpr);
        this.rightItem = new PreviewCellItem(this.scene, 155 * dpr, 38 * dpr, dpr);
        this.leftItem.x = - this.leftItem.width * 0.5;
        this.rightItem.x = this.leftItem.width * 0.5;
        this.add([this.bg, this.leftItem, this.rightItem]);
    }
    public setRoamData(data: any, alpha: number) {
        this.leftItem.setDrawData(data[0]);
        this.rightItem.setDrawData(data[1]);
        this.bg.alpha = alpha;
    }
}

class PreviewCellItem extends Phaser.GameObjects.Container {
    private image: Phaser.GameObjects.Image;
    private nameTex: Phaser.GameObjects.Text;
    private value: Phaser.GameObjects.Text;
    private dpr: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.init();
    }

    init() {
        this.nameTex = this.scene.make.text({ text: "", style: UIHelper.blackStyle(this.dpr) }).setOrigin(0, 0.5);
        this.image = this.scene.make.image({ key: UIAtlasName.roam, frame: "roam_preview_star_1" });
        this.value = this.scene.make.text({ text: "", style: UIHelper.blackStyle(this.dpr) }).setOrigin(0, 0.5);
        this.add([this.nameTex, this.image, this.value]);
    }

    public setDrawData(data: any) {
        this.nameTex.text = data.name;
        if (data.star > 0) {
            this.image.visible = true;
            this.image.setFrame("roam_preview_star_" + data.star);
        } else {
            this.image.visible = false;
        }
        this.value.text = data.prob + "%";
        this.nameTex.x = -this.width * 0.5 + 15 * this.dpr;
        this.image.x = this.nameTex.x + this.nameTex.width + this.image.width * 0.5 + 3 * this.dpr;
        this.value.x = this.width * 0.5 - this.value.width - 15* this.dpr;
    }
}
