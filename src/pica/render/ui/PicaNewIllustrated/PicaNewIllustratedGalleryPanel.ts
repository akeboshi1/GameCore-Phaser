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
    private slidermoving: boolean = false;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.init();
        this.on("pointerup", this.onSliderUpHandler, this);
    }
    resize(width?: number, height?: number) {
        const w = width || this.width;
        const h = height || this.height;
        this.setSize(w, h);
        this.gridLayout.setSize(w, h);
        this.gridLayout.y = -this.height * 0.5 + this.gridLayout.height * 0.5;
        this.bottomPageTex.y = this.height * 0.5 - 40 * this.dpr;
        this.horSlider.y = this.bottomPageTex.y + 20 * this.dpr;
        this.setInteractive();
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    setGallaryData(content: any) { // op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY
        if (!content) return;
        this.galleryData = content;
        const list = content.list;
        this.maxPage = Math.ceil(list.length / (this.pagInterval * 4));
        this.setItemPages(1);

    }

    init() {
        const cellHeight = 96 * this.dpr;
        const conWidth = this.width, conHeight = 100 * this.dpr;
        this.gridLayout = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(conWidth, cellHeight),
            space: new Phaser.Math.Vector2(0, 10 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 1,
            alignmentType: AlignmentType.UpperCenter
        });
        this.add(this.gridLayout);
        this.bottomPageTex = this.scene.make.text({ style: UIHelper.colorStyle("#3E5DB2", 12 * this.dpr) }).setOrigin(0.5);
        const sliderbg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_page_bottom" });
        const indicator = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_page_top" });
        const thumb = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_page" });
        this.thumb = thumb;
        this.pageCountText = this.scene.make.text({ style: UIHelper.colorStyle("#744803", 14 * this.dpr) }).setOrigin(0.5);
        this.horSlider = new GameSlider(this.scene, {
            x: 0, y: 0, width: 330 * this.dpr, height: 4 * this.dpr, orientation: 1,
            background: sliderbg,
            indicator,
            thumb,
            offsetX: thumb.width * 0.5,
            valuechangeCallback: this.onSliderValueHandler,
            valuechangeCallbackScope: this,
            value: 0.5
        });
        thumb.on("pointerup", this.onSliderUpHandler, this);
        this.horSlider.add(this.pageCountText);
        this.horSlider.setValue(0);
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
            item.visible = true;
        }
        this.gridLayout.Layout();
        this.gridLayout.y = -this.height * 0.5 + this.gridLayout.height * 0.5;
    }

    private getItemDataArr(datas: any[]) {
        const temps: any[] = [];
        for (let i = 0; i < datas.length; i += 4) {
            const temp = datas.slice(i, i + 4);
            temps.push(temp);
        }
        return temps;
    }
    private setItemPages(page: number) {
        const interval = this.pagInterval * 4;
        const list = this.galleryData.list;
        const indexed = (page - 1) * interval;
        const datas = list.slice(indexed, indexed + interval);
        const temps = this.getItemDataArr(datas);
        this.bottomPageTex.text = `${page}/${this.maxPage}`;
        this.setHorizontalItems(temps);
    }

    private onSelectItemHandler(cell: PicaNewIllustratedItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
        //  cell.showTips();
        if (this.send) this.send.runWith(["furidetail", cell.itemData]);
    }

    private onSliderValueHandler(value: number) {
        this.pageCountText.x = this.thumb.x;
        let page = Math.floor(this.maxPage * value + 1);
        if (page >= 8) page = 7;
        this.pageCount = page;
        this.pageCountText.text = `${this.pageCount < 10 ? "0" + this.pageCount : this.pageCount}`;
        this.slidermoving = true;
    }

    private onSliderUpHandler() {
        if (this.slidermoving) {
            this.setItemPages(this.pageCount);
        }
        this.slidermoving = false;
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
        this.bg = this.scene.make.image({ key: UIAtlasName.illustrate_new, frame: "illustrate_survey_list_bg" });
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
            item.visible = true;
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
