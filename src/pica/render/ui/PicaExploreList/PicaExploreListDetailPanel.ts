
import { op_client } from "pixelpai_proto";
import { ClickEvent, Button, GameGridTable } from "apowophaserui";
import { Font, Handler, i18n, ResUtils, Tool, UIHelper } from "utils";
import { UIAtlasName } from "picaRes";
import { ItemButton } from "../Components";
import { AlignmentType, AxisType, ButtonEventDispatcher, ConstraintType, GridLayoutGroup, GridLayoutGroupConfig, ProgressMaskBar } from "gamecoreRender";
import { ChineseUnit } from "structure";
import { PicaChapterLevelClue } from "./PicaChapterLevelClue";
export class PicaExploreListDetailPanel extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected zoom: number;
    private content: Phaser.GameObjects.Container;
    private bg: Phaser.GameObjects.Image;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private backButton: Button;
    private lineGraphic: Phaser.GameObjects.Graphics;
    private titleTex: Phaser.GameObjects.Text;
    private captoreTex: Phaser.GameObjects.Text;
    private taskTex: Phaser.GameObjects.Text;
    private captoreDes: Phaser.GameObjects.Text;
    private mPropGrid: GameGridTable;
    private needItems: PicaChapterLevelClue[] = [];
    private labels: Phaser.GameObjects.Image[] = [];
    private needDatas: op_client.ICountablePackageItem[] = [];
    private indexed: number = -1;
    private labelsCount: number = 0;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
        this.setInteractive();
    }

    public resize(w: number, h: number) {
        this.setSize(w, h);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0x000000, 0.73);
        this.blackGraphic.fillRect(0, 0, w, h);
        this.blackGraphic.x = -w * 0.5;
        this.blackGraphic.y = -h * 0.5;
        this.lineGraphic.clear();
        this.lineGraphic.fillStyle(0x0B0B0B, 1);
        this.lineGraphic.fillRect(-12 * this.dpr, -this.dpr, 24 * this.dpr, 2 * this.dpr);
        this.mPropGrid.resetMask();
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    public setCaptoreResultData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT) {
        const numTex = i18n.language !== "zh-CN" ? data.chapter.chapterId + "" : ChineseUnit.numberToChinese(data.chapter.chapterId);
        this.titleTex.text = i18n.t("explore.chaptertitle", { name: numTex });
        this.captoreTex.text = "皮卡熊的任务";
        this.captoreDes.text = "帮助皮大熊在本章节中找到某某某几件道具，和某某某几件道具，以完成什么什么家具和什么什么家具家具的修复。";
        this.taskTex.text = i18n.t("explore.taskneedtips");
        this.needDatas.length = 0;
        for (const level of data.levels) {
            for (const item of level.clueItems) {
                this.needDatas.push(item);
            }
        }
        this.setNeedItems(this.needDatas);
        const count = Math.ceil(this.needDatas.length / 6);
        this.setNeedBottomImgs(count);
        this.setLabelsSelect(0);
    }

    protected setNeedItems(datas: op_client.ICountablePackageItem[]) {
        const gridDatas = [];
        for (let i = 0; i < datas.length; i += 6) {
            const temps = [];
            for (let j = i; j < i + 6; j++) {
                if (j < datas.length)
                    temps.push(datas[j]);
            }
            gridDatas.push(temps);
        }
        this.mPropGrid.setItems(gridDatas);
    }

    protected setNeedBottomImgs(count: number) {
        this.labelsCount = count;
        for (const label of this.labels) {
            label.visible = false;
        }
        for (let i = 0; i < count; i++) {
            let label: Phaser.GameObjects.Image;
            if (i < this.labels.length) {
                label = this.labels[i];
            } else {
                label = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_page_down" });
                this.content.add(label);
                this.labels.push(label);
            }
            label.visible = true;
        }
        this.setLabelLayout(count);
    }
    protected init() {
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.add(this.blackGraphic);
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "explore_chapter_total_open" });
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.bg.width, this.bg.height);
        this.add(this.content);
        this.backButton = new Button(this.scene, UIAtlasName.uicommon, "close");
        this.backButton.on(ClickEvent.Tap, this.onHideHandler, this);
        this.backButton.x = this.content.width * 0.5;
        this.backButton.y = -this.content.height * 0.5;
        const leftMidx = -75 * this.dpr, rightMidx = 75 * this.dpr;
        const topy = -this.content.height * 0.5 + 20 * this.dpr;
        this.titleTex = this.scene.make.text({ style: UIHelper.colorStyle("#8743B9", 14 * this.dpr) }).setOrigin(0.5);
        this.titleTex.setFontStyle("bold");
        this.titleTex.x = leftMidx;
        this.titleTex.y = topy;
        this.captoreTex = this.scene.make.text({ style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0.5);
        this.captoreTex.setFontStyle("bold");
        this.captoreTex.y = this.titleTex.y + 25 * this.dpr;
        this.captoreTex.x = leftMidx;
        this.lineGraphic = this.scene.make.graphics(undefined, false);
        this.lineGraphic.x = leftMidx;
        this.lineGraphic.y = this.captoreTex.y + 15 * this.dpr;
        this.captoreDes = this.scene.make.text({ style: UIHelper.blackStyle(this.dpr, 11) }).setOrigin(0);
        this.captoreDes.setWordWrapWidth(117 * this.dpr, true);
        this.captoreDes.x = leftMidx - 58 * this.dpr;
        this.captoreDes.y = this.lineGraphic.y + 16 * this.dpr;
        this.taskTex = this.scene.make.text({ style: UIHelper.blackStyle(this.dpr, 14) }).setOrigin(0.5);
        this.taskTex.setFontStyle("bold");
        this.taskTex.x = rightMidx;
        this.taskTex.y = this.captoreTex.y;
        this.mPropGrid = this.createGrid();
        this.mPropGrid.x = rightMidx + 5 * this.dpr;
        this.mPropGrid.y = 15 * this.dpr;
        this.content.add([this.bg, this.backButton, this.titleTex, this.captoreTex, this.lineGraphic, this.captoreDes, this.taskTex, this.mPropGrid]);
        this.resize(this.width, this.height);
    }

    private setLabelLayout(count: number) {
        const cellwidth = 6 * this.dpr, space = 8 * this.dpr, posy = this.content.height * 0.5 - 30 * this.dpr;
        const rightMidx = 110 * this.dpr;
        let posx = rightMidx - ((cellwidth * count + space * (count - 1)) / 0.5) + cellwidth * 0.5;
        for (let i = 0; i < count; i++) {
            const label = this.labels[i];
            label.x = posx;
            label.y = posy;
            posx += cellwidth + space;
        }
    }

    private onHideHandler() {
        if (this.send) this.send.runWith("hide");
    }

    private createGrid() {
        const capW = 110 * this.dpr;
        const capH = 157 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 0,
            table: {
                width: 110 * this.dpr,
                height: 157 * this.dpr,
                columns: 1,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
                zoom: this.zoom,
                mask: true
            },
            scrollMode: 1,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const item = cell.item;
                if (cellContainer === null) {
                    cellContainer = this.createGridLayout();
                }
                cellContainer.setItems(item);
                return cellContainer;
            },
            onScrollValueChange: (value) => {
                if (value < 0) value = 0;
                else if (value > 1) value = 1;
                const indexed = Math.floor((value * this.labelsCount));
                this.setLabelsSelect(indexed);
            }
        };
        const mPropGrid = new GameGridTable(this.scene, tableConfig);
        mPropGrid.layout();
        mPropGrid.on("cellTap", (cell) => {
            if (cell) {
                this.onSelectItemHandler(cell, this.scene.input.activePointer);
            }
        });
        return mPropGrid;
    }

    private setLabelsSelect(indexed: number) {
        if (this.indexed === indexed) return;
        if (indexed >= this.labelsCount) indexed = this.labelsCount - 1;
        for (let i = 0; i < this.labelsCount; i++) {
            if (indexed === i) {
                this.labels[i].setFrame("explore_page_up");
            } else {
                this.labels[i].setFrame("explore_page_down");
            }
        }
        this.indexed = indexed;
    }

    private createGridLayout() {
        const gridlayout = new ChapterGridLayout(this.scene, 120 * this.dpr, 157 * this.dpr, this.dpr, {
            cellSize: new Phaser.Math.Vector2(45 * this.dpr, 45 * this.dpr),
            space: new Phaser.Math.Vector2(15 * this.dpr, 5 * this.dpr),
            startAxis: AxisType.Vertical,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 2,
            alignmentType: AlignmentType.UpperCenter
        });
        return gridlayout;
    }

    private onSelectItemHandler(obj, pointer) {
        // obj.showTips();
        obj.checkPointer(pointer);
    }

}

class ChapterGridLayout extends GridLayoutGroup {
    private items: PicaChapterLevelClue[] = [];
    private dpr: number;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, config: GridLayoutGroupConfig) {
        super(scene, 0, 0, config);
        this.dpr = dpr;
        this.setSize(width, height);
    }
    public setItems(datas: op_client.ICountablePackageItem[]) {
        for (const item of this.items) {
            item.visible = false;
        }
        for (let i = 0; i < datas.length; i++) {
            let item: PicaChapterLevelClue;
            if (i < this.items.length) {
                item = this.items[i];
            } else {
                item = new PicaChapterLevelClue(this.scene, this.dpr, 43 * this.dpr, 43 * this.dpr);
                this.add(item);
                this.items.push(item);
            }
            item.visible = true;
            item.setItemData(datas[i]);
        }
        this.Layout();
    }

    public checkPointer(pointer) {
        for (const item of this.items) {
            if (item.visible) {
                if (Tool.checkPointerContains(item, pointer)) {
                    item.showTips();
                }
            }
        }
    }
}
