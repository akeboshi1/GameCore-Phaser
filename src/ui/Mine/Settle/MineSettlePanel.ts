import { WorldService } from "../../../game/world.service";
import { Font } from "../../../utils/font";
import { DynamicImage } from "../../components/dynamic.image";
import GridTable from "../../../../lib/rexui/lib/ui/gridtable/GridTable";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { BasePanel } from "../../components/BasePanel";
import { NinePatch } from "../../components/nine.patch";
import { NinePatchButton } from "../../components/ninepatch.button";
export class MineSettlePanel extends BasePanel {

    private key: string = "mine_settle";
    private confirmBtn: NinePatchButton;
    private mPropGrid: GridTable;
    private mPropContainer: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
    }
    resize(width: number, height: number) {
        super.resize(width, height);
        this.x = width / 2;
        this.y = height / 2;
        this.mPropGrid.x = this.x;
        this.mPropGrid.y = this.y ;// + 16 * this.dpr;
        this.mPropGrid.layout();
        const zoom = this.mWorld.uiScaleNew;
        // const attributesMask = this.mPropGrid.childrenMap.table;
        // attributesMask.x = -this.width / 2 + 30 * this.dpr * zoom;
        // attributesMask.y = 5 * this.dpr * zoom;
        // this.mPropContainer.x = -this.x;
        // this.mPropContainer.y = -this.y; // + 8 * this.dpr;
        this.setSize(width, height);
    }

    preload() {
        this.addAtlas(this.key, "minesettle/Settlement.png", "minesettle/Settlement.json");
        super.preload();
    }

    init() {
        const zoom = this.mWorld.uiScaleNew;
        const bg = new NinePatch(this.scene, 0, 0, 300 * this.dpr, 300 * this.dpr, this.key, "bg", {
            left: 10,
            top: 10,
            right: 10,
            bottom: 10
        });
        const topline = this.scene.make.image({ x: 0, y: -150 * this.dpr, key: this.key, frame: "bg_edge" });
        const bottomline = this.scene.make.image({ x: 0, y: 150 * this.dpr, key: this.key, frame: "bg_edge" });
        const titleimage = this.scene.make.image({ x: 0, y: -206 * this.dpr, key: this.key, frame: "title" }, false);
        const tilteName = this.scene.make.text({
            x: 0, y: -158 * this.dpr, text: "获得物品",
            style: { fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0.5, 0.5);
        this.mPropContainer = this.scene.make.container(undefined, false);
        const propFrame = this.scene.textures.getFrame(this.key, "icon_test");
        const capW = (propFrame.width + 20 * this.dpr);
        const capH = (propFrame.height + 20 * this.dpr);
        this.mPropGrid = new GridTable(this.scene, {
            x: 0,
            y: 0,
            background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            table: {
                width: 260 * this.dpr,
                height: 260 * this.dpr,
                columns: 5,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
            },
            clamplChildOY: true,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new MineSettleItem(scene);
                    this.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setItemData(item, this.dpr);

                return cellContainer;
            },
        });

        this.mPropGrid.layout();
        this.mPropGrid.on("cell.1tap", (cell) => {
            const data = cell.itemData;
            if (data) {
                this.onSelectItemHandler(data);
            }
        });
        this.scene.add.existing(this.mPropGrid);
        this.confirmBtn = new NinePatchButton(this.scene, 0, 120 * this.dpr, 100 * this.dpr, 40 * this.dpr, this.key, "button", "存入背包", {
            left: 20,
            top: 20,
            right: 20,
            bottom: 20
        });
        this.confirmBtn.setTextStyle({
            color: "#976400",
            fontSize: 16 * this.dpr * zoom,
            fontFamily: Font.DEFULT_FONT
        });
        this.confirmBtn.setInteractive();
        this.confirmBtn.on("pointerup", this.onConfirmBtnClick, this);

        this.add([bg, topline, bottomline, titleimage, tilteName, this.confirmBtn, this.mPropContainer]);
        super.init();
        this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
        this.setMineSettlePacket(this.testData());
    }

    setMineSettlePacket(content: op_client.CountablePackageItem[]) {
        this.mPropGrid.setItems(content);
        this.mPropGrid.layout();
    }

    destroy() {
        if (this.mPropGrid) this.mPropGrid.destroy();
        if (this.confirmBtn) this.confirmBtn.destroy();
        this.mPropGrid = null;
        this.confirmBtn = null;
        super.destroy();
    }

    private onSelectItemHandler(data: op_client.ICountablePackageItem) {

    }

    private onConfirmBtnClick() {
        this.hide();
    }

    private testData(): op_client.CountablePackageItem[] {
        const arr = [];
        for (let i = 0; i < 50; i++) {
            const data = new op_client.CountablePackageItem();
            data.count = i * 2;
            data.name = "我的矿石";
            data.display = new op_gameconfig.Display();
            data.display.texturePath = "resources/test/icon_test.png";
            arr.push(data);
        }

        return arr;
    }

}

class MineSettleItem extends Phaser.GameObjects.Container {
    public itemData: op_client.ICountablePackageItem;
    private itemCount: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private dpr: number;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.icon = new DynamicImage(scene, 0, 0);
        this.itemCount = this.scene.make.text({
            text: "600",
            style: {
                fontSize: 20,
                fontFamily: Font.DEFULT_FONT
            }
        }, false);
        this.itemCount.setOrigin(0.5, 0);
        this.itemCount.setPosition(0, this.icon.height);
        this.add(this.icon);
        this.add(this.itemCount);
    }
    public setItemData(data: op_client.ICountablePackageItem, dpr: number) {
        this.itemData = data;
        this.dpr = dpr;
        this.itemCount.setFontSize(dpr * 14);
        this.itemCount.text = data.count + "";
        const url = data.display.texturePath;
        this.icon.load(url, this, () => {
            // this.itemCount.setPosition(0, 10 * dpr);
            this.icon.setDisplaySize(33 * this.dpr, 33 * this.dpr);
        });
    }
    public destroy() {
        super.destroy();
        if (this.icon) this.icon.destroy();
        if (this.itemCount) this.itemCount.destroy();
        this.itemData = null;
        this.icon = null;
        this.itemCount = null;
        this.scene = null;
    }

}
