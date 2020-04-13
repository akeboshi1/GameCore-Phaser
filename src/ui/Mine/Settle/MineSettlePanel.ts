import { WorldService } from "../../../game/world.service";
import { Button } from "../../components/button";
import { Font } from "../../../utils/font";
import { DynamicImage } from "../../components/dynamic.image";
import GridTable from "../../../../lib/rexui/lib/ui/gridtable/GridTable";
import { op_client } from "pixelpai_proto";
import { BasePanel } from "../../components/BasePanel";
export class MineSettlePanel extends BasePanel {

    private key: string = "mine_settle";
    private tilteName: Phaser.GameObjects.Text;
    private corirmBtn: Button;
    private mPropGrid: GridTable;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
    }
    resize(w: number, h: number) {
        super.resize(w, h);
    }

    preload() {
        this.addAtlas(this.key, "main_ui/main_ui.png", "main_ui/main_ui.json");
        super.preload();
    }

    init() {
        const zoom = this.mWorld.uiScaleNew;
        const bg = this.scene.make.image({ key: this.key, frame: "" });
        const titleimage = this.scene.make.image({ key: this.key, frame: "" });
        this.tilteName = this.scene.make.text({
            text: "600",
            style: {
                fontSize: 20,
                fontFamily: Font.DEFULT_FONT
            }
        });
        titleimage.setPosition(100 * this.dpr, 90 * this.dpr);
        this.tilteName.setPosition(100 * this.dpr, 100 * this.dpr);
        this.mPropGrid = new GridTable(this.scene, {
            scrollMode: 0,
            table: {
                width: 100 * this.dpr * zoom,
                height: 100 * this.dpr * zoom,
                columns: 5,
                cellWidth: 90,
                cellHeigth: 90,
                reuseCellContainer: true,
            },
            clamplChildOY: true,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new SettleItem(scene);
                }
                cellContainer.setData(item, this.dpr);
                return cellContainer;
            },
        });

        this.mPropGrid.on("cell.1tap", (cell) => {
            const data = cell.data;
            if (data) {
                this.onSelectItemHandler(data);
            }
        });
        this.add([bg, titleimage, this.tilteName]);
    }

    setMineSettlePacket(content: op_client.CountablePackageItem[]) {
        this.mPropGrid.setItems(content);
    }

    destroy() {
        if (this.tilteName) this.tilteName.destroy();
        if (this.mPropGrid) this.mPropGrid.destroy();
        if (this.corirmBtn) this.corirmBtn.destroy();
        this.tilteName = null;
        this.mPropGrid = null;
        this.corirmBtn = null;
        super.destroy();
    }

    private onSelectItemHandler(data: op_client.ICountablePackageItem) {

    }

}

class SettleItem {
    public data: op_client.ICountablePackageItem;
    private count: Phaser.GameObjects.Text;
    private icon: DynamicImage;
    private scene: Phaser.Scene;
    private dpr: number;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.icon = new DynamicImage(scene, 0, 0);
        this.count = this.scene.make.text({
            text: "600",
            style: {
                fontSize: 20,
                fontFamily: Font.DEFULT_FONT
            }
        }, false);
        this.count.setOrigin(0.5, 0);
    }

    public setData(data: op_client.ICountablePackageItem, dpr: number) {
        this.dpr = dpr;
        this.data = data;
        this.count.setFontSize(dpr * 20);
        this.count.text = data.count + "";
        const url = data.display.texturePath;
        this.icon.load(url);
    }
    public setPosition(x: number, y: number) {
        const offsetX: number = 10 * this.dpr;
        const offsetY: number = 10 * this.dpr;
        this.icon.setPosition(x + offsetX, y + offsetY);
        this.count.setPosition(x + offsetX, y + offsetY - 10 * this.dpr);
    }

    public destroy() {
        if (this.icon) this.icon.destroy();
        if (this.count) this.count.destroy();
        this.data = null;
        this.icon = null;
        this.count = null;
        this.scene = null;
    }

}
