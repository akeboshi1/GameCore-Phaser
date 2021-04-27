import { ClickEvent, GameGridTable, GameSlider } from "apowophaserui";
import { AlignmentType, AxisType, ConstraintType, GridLayoutGroup, ProgressMaskBar } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { ICountablePackageItem } from "picaStructure";
import { Handler, UIHelper } from "utils";
import { PicaNewIllustratedItem } from "./PicaNewIllustratedItem";
export class PicaNewIllustratedGalleryPanel extends Phaser.GameObjects.Container {
    private gridLayout: GridLayoutGroup;
    private horSlider: GameSlider;
    private thumb: Phaser.GameObjects.Image;
    private pageCountText: Phaser.GameObjects.Text;
    private bottomPageTex: Phaser.GameObjects.Text;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private curSelectItem: PicaNewIllustratedItem;
    private horizontalItem: IllustratedHorizontalItem[] = [];
    private pageCount: number = 0;
    private maxPage: number = 0;
    private pagInterval: number = 4;
    private galleryData: any;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
        this.setInteractive();
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.setSize(w, h);
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    setGallaryData(content: any) { // op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY
        if (!content) return;
        this.galleryData = content;
        const list = content.list;
        this.maxPage = Math.ceil(list / (this.pagInterval * 4));
        this.setItemPages(0);

    }

    init() {
        const cellHeight = 96 * this.dpr;
        const conWidth = 330 * this.dpr, conHeight = 400 * this.dpr;
        this.gridLayout = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(conWidth, cellHeight),
            space: new Phaser.Math.Vector2(0, 4 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.add(this.gridLayout);
        this.gridLayout.y = -this.height * 0.5 + conHeight * 0.5;
        this.bottomPageTex = this.scene.make.text(UIHelper.colorStyle("#3E5DB2", 12 * this.dpr)).setOrigin(0.5);
        this.bottomPageTex.y = this.height * 0.5 - 40 * this.dpr;
        const sliderbg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_page_bottom" });
        const indicator = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_page_top" });
        const thumb = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_page" });
        this.thumb = thumb;
        this.pageCountText = this.scene.make.text(UIHelper.colorStyle("#744803", 14 * this.dpr)).setOrigin(0.5);
        this.horSlider = new GameSlider(this.scene, {
            x: 0, y: 0, width: 330 * this.dpr, height: 7 * this.dpr, orientation: 1,
            background: sliderbg,
            indicator,
            thumb,
            offsetX: thumb.width * 0.5,
            valuechangeCallback: this.onSliderValueHandler,
            valuechangeCallbackScope: this,
            value: 0.5
        });
        this.horSlider.slider.on("pointerup", this.onSliderUpHandler, this);
        this.horSlider.add(this.pageCountText);
        this.horSlider.setValue(0);
        this.horSlider.y = this.bottomPageTex.y + 20 * this.dpr;
        this.add([this.gridLayout, this.bottomPageTex, this.horSlider]);
        this.resize();
    }

    private setHorizontalItems(datas: any[]) {
        for (const item of this.horizontalItem) {
            item.visible = false;
        }
        const itemWidth = 330 * this.dpr, itemHeight = 96 * this.dpr;
        for (let i = 0; i < datas.length; i++) {
            let item: IllustratedHorizontalItem;
            if (i < this.horizontalItem.length) {
                item = this.horizontalItem[i];
            } else {
                item = new IllustratedHorizontalItem(this.scene, itemWidth, itemHeight, this.dpr, this.zoom);
                item.setHandler(new Handler(this, this.onSelectItemHandler));
                this.gridLayout.add(item);
                this.horizontalItem.push(item);
            }
            item.setItemDatas(datas[i]);
        }
        this.gridLayout.Layout();
    }

    private getItemDataArr(datas: any[]) {
        const temps: any[] = [];
        for (let i = 0; i < datas.length; i += 5) {
            const temp = datas.slice(i, i + 5);
            temps.push(temp);
        }
        return temps;
    }
    private setItemPages(page: number) {
        const interval = this.pagInterval * 4;
        const list = this.galleryData.list;
        const indexed = this.pageCount * interval;
        const datas = list.slice(indexed, indexed + interval);
        const temps = this.getItemDataArr(datas);
        this.setHorizontalItems(temps);
    }

    private onSelectItemHandler(cell: PicaNewIllustratedItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
        //  cell.showTips();
        if (this.send) this.send.runWith(["furidetail", cell.itemData]);
    }

    private onSliderValueHandler(value: number) {
        this.pageCountText.x = this.thumb.x;
        this.pageCount = Math.floor(this.maxPage * value);
        this.pageCountText.text = `${this.pageCount < 10 ? "0" + this.pageCount : this.pageCount}`;
    }

    private onSliderUpHandler() {
        this.setItemPages(this.pageCount);
        this.bottomPageTex.text = `${this.pageCount}/${this.maxPage}`;
    }

}
class IllustratedHorizontalItem extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private items: PicaNewIllustratedItem[] = [];
    private dpr: number;
    private zoom: number;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key: UIAtlasName.illustrate_new, fame: "illustrate_survey_list_bg" });
        this.bg.y = height * 0.5 - this.bg.height * 0.5;
        this.add(this.bg);
    }

    public setItemDatas(datas: ICountablePackageItem[]) {
        for (const item of this.items) {
            item.visible = false;
        }
        let posx = -114 * this.dpr;
        const space = 32 * this.dpr, itemWidth = 48 * this.dpr, itemHeight = 95 * this.dpr;
        for (let i = 0; i < datas.length; i++) {
            let item: PicaNewIllustratedItem;
            if (i < this.items.length) {
                item = this.items[i];
            } else {
                item = new PicaNewIllustratedItem(this.scene, itemWidth, itemHeight, this.dpr, this.zoom);
                item.on(ClickEvent.Tap, this.onItemHandler, this);
                this.add(item);
                this.items.push(item);
            }
            item.setItemData(datas[i]);
            item.x = posx;
            posx += itemWidth + space;
        }
    }
    public setHandler(send: Handler) {
        this.send = send;
    }

    private onItemHandler(pointer: any, item: PicaNewIllustratedItem) {
        if (this.send) this.send.runWith(item.itemData);
    }
}
