import { GameGridTable, Button, ClickEvent } from "apowophaserui";
import { AlignmentType, AxisType, ConstraintType, GridLayoutGroup, ProgressMaskBar } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Tool, UIHelper, Url } from "utils";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ItemButton } from "picaRender";
import { ICountablePackageItem, IGalleryCombination } from "picaStructure";
import { IllustratedItem } from "./PicaIllustratedItem";
export class PicaIllustredCollectPanel extends Phaser.GameObjects.Container {

    private mGameGrid: GameGridTable;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    private curSelectItem: IllustratedCollectItem;
    private combinations: IGalleryCombination[];
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
        this.mGameGrid.setSize(w, h);
        this.mGameGrid.resetMask();
    }

    setHandler(send: Handler) {
        this.send = send;
    }

    setCombinationData(content: IGalleryCombination[]) {
        this.mGameGrid.setItems(content);
        this.mGameGrid.layout();
        this.mGameGrid.setT(0);
    }

    init() {
        const tableHeight = this.height;
        const cellWidth = 326 * this.dpr;
        const cellHeight = 290 * this.dpr;
        const tableConfig = {
            x: 15 * this.dpr,
            y: 0,
            table: {
                width: this.width,
                height: tableHeight,
                columns: 1,
                cellWidth,
                cellHeight,
                reuseCellContainer: true,
                cellPadX: 0 * this.dpr,
                zoom: this.zoom
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = this.mGameGrid.items.length - cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new IllustratedCollectItem(this.scene, cellWidth, cellHeight, this.dpr, this.zoom);
                    cellContainer.setHandler(this.send);
                }
                cellContainer.setCombinationData(item);
                // cell.setHeight(cellContainer.height);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.mGameGrid.on("cellTap", (cell) => {
            this.onSelectItemHandler(cell);
        });
        this.add(this.mGameGrid);
        this.resize();
    }

    private onSelectItemHandler(cell: IllustratedCollectItem) {
        // if (this.curSelectItem) this.curSelectItem.select = true;
        cell.checkExtendRect();
    }
}

class IllustratedCollectItem extends Phaser.GameObjects.Container {
    public isTooqingContainerLite = true;
    private background: Phaser.GameObjects.Graphics;
    private titleTex: Phaser.GameObjects.Text;
    private desTex: Phaser.GameObjects.Text;
    private progress: ProgressMaskBar;
    private rewardsBtn: Button;
    private gridLayout: GridLayoutGroup;
    private topCon: Phaser.GameObjects.Container;
    private send: Handler;
    private dpr: number;
    private zoom: number;
    private combiData: IGalleryCombination;
    private iscallRewards: boolean = false;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.background = this.scene.make.graphics(undefined, false);
        this.background.clear();
        this.background.fillStyle(0x5EC6FF, 1);
        this.background.fillRoundedRect(-width * 0.5, -height * 0.5, width, height, 5 * dpr);
        this.topCon = this.scene.make.container(undefined, false);
        this.topCon.setSize(this.width, 58 * this.dpr);
        this.titleTex = this.scene.make.text({ style: UIHelper.whiteStyle(dpr) }).setOrigin(0, 0.5);
        this.titleTex.x = -this.topCon.width * 0.5 + 15 * dpr;
        this.titleTex.y = -this.topCon.height * 0.5 + 20 * dpr;
        this.titleTex.setFontStyle("bold");
        this.desTex = this.scene.make.text({ style: UIHelper.colorStyle("#006ED4", 10 * dpr) }).setOrigin(0, 0.5);
        this.desTex.x = this.titleTex.x;
        this.desTex.y = this.titleTex.y + 20 * dpr;
        this.progress = new ProgressMaskBar(this.scene, UIAtlasName.illustrate, "illustrate_survey_lv_bottom", "illustrate_survey_lv_top", UIHelper.whiteStyle(this.dpr, 8));
        this.progress.y = this.desTex.y + this.progress.height * 0.5 + 15 * this.dpr;
        this.progress.x = -20 * this.dpr;
        this.rewardsBtn = new Button(this.scene, UIAtlasName.illustrate, "illustrate_survey_icon", "illustrate_survey_icon");
        this.rewardsBtn.x = this.progress.x + this.progress.width * 0.5 + 10 * this.dpr + this.rewardsBtn.width * 0.5;
        this.rewardsBtn.y = this.progress.y - this.rewardsBtn.height * 0.5;
        this.rewardsBtn.on(ClickEvent.Tap, this.onRewardsHandler, this);
        this.topCon.add([this.titleTex, this.desTex, this.progress, this.rewardsBtn]);
        const conWidth = 305 * this.dpr, conHeight = this.height - this.topCon.height;
        this.gridLayout = new GridLayoutGroup(this.scene, conWidth, conHeight, {
            cellSize: new Phaser.Math.Vector2(87 * this.dpr, 92 * this.dpr),
            space: new Phaser.Math.Vector2(-10 * dpr, 0 * this.dpr),
            startAxis: AxisType.Horizontal,
            constraint: ConstraintType.FixedColumnCount,
            constraintCount: 4,
            alignmentType: AlignmentType.UpperCenter
        });
        this.add([this.background, this.topCon, this.gridLayout]);
    }
    public refreshMask() {
        this.progress.refreshMask();
    }
    public syncPosition() {
        this.refreshMask();
    }
    public getAllChildren() {

    }
    public setCombinationData(data: IGalleryCombination) {
        this.combiData = data;
        this.titleTex.text = data.name;
        this.desTex.text = data.des;
        const list = this.gridLayout.list;
        for (const item of list) {
            (<any>item).visible = false;
        }
        let curprogress = 0;
        const maxprogress = data.requirement.length;
        for (let i = 0; i < data.requirement.length; i++) {
            const temp = data.requirement[i];
            let item: IllustratedItem;
            if (i < list.length) {
                item = <any>list[i];
            } else {
                item = new IllustratedItem(this.scene, 87 * this.dpr, 92 * this.dpr, this.dpr, this.zoom);
                this.gridLayout.add(item);
            }
            item.visible = true;
            item.setItemData(<ICountablePackageItem>temp);
            if (temp["status"] === 2) curprogress++;
        }
        this.progress.setProgress(curprogress, maxprogress);
        this.progress.setText(`${curprogress}/${maxprogress}`);
        this.iscallRewards = curprogress === maxprogress;
        this.gridLayout.Layout();
        this.layout();
    }

    public setHandler(send: Handler) {
        this.send = send;
    }
    public checkExtendRect() {
        if (!this.gridLayout.visible) return false;
        const pointer = this.scene.input.activePointer;
        const isCheck = Tool.checkPointerContains(this.gridLayout, pointer);
        if (isCheck) {
            const list = this.gridLayout.list;
            for (const obj of list) {
                if (Tool.checkPointerContains(obj, pointer)) {
                    (<IllustratedItem>obj).showTips();
                }
            }
        }
    }
    private layout() {
        const offsetY = 20 * this.dpr;
        const height = this.height;// this.topCon.height + this.gridLayout.height;

        this.setSize(this.width, height);
        this.background.clear();
        this.background.fillStyle(0x5EC6FF, 1);
        const backheight = height - 10 * this.dpr;
        this.background.fillRect(-this.width * 0.5, -height * 0.5, this.width, backheight);
        this.topCon.y = -this.height * 0.5 + this.topCon.height * 0.5;
        this.gridLayout.y = this.topCon.y + this.topCon.height * 0.5 + this.gridLayout.height * 0.5 + offsetY;
    }
    private onRewardsHandler() {
        if (this.send && this.iscallRewards) this.send.runWith(["combinations", this.combiData.id]);
    }
}
