import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { DynamicImage } from "../components/dynamic.image";
import GridTable from "../../../lib/rexui/lib/ui/gridtable/GridTable";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { NinePatch } from "../components/nine.patch";
import { NinePatchButton } from "../components/ninepatch.button";
import { Url } from "../../utils/resUtil";
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
        this.mPropGrid.y = this.y - 30 * this.dpr;
        this.mPropGrid.layout();
        this.mPropContainer.x = -this.x + 8 * this.dpr;
        this.mPropContainer.y = -this.y; // + 8 * this.dpr;
        this.setSize(width, height);
    }

    show(param?: any) {
        super.show(param);
        this.refreshData();
    }

    addListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.on("pointerup", this.onConfirmBtnClick, this);
    }

    removeListen() {
        if (!this.mInitialized) return;
        this.confirmBtn.on("pointerup", this.onConfirmBtnClick, this);
    }

    preload() {
        this.addAtlas(this.key, "minesettle/settlement.png", "minesettle/settlement.json");
        super.preload();
    }

    init() {
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
        this.mPropContainer.setSize(300 * this.dpr, 210 * this.dpr);
        const propFrame = this.scene.textures.getFrame(this.key, "icon_test");
        const capW = (propFrame.width + 20 * this.dpr);
        const capH = (propFrame.height + 30 * this.dpr);
        this.mPropGrid = new GridTable(this.scene, {
            x: 0,
            y: 0,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            table: {
                width: 260 * this.dpr,
                height: 210 * this.dpr,
                columns: 5,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
            },
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new MineSettleItem(scene, this.dpr);
                    this.mPropContainer.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setItemData(item);

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
        this.confirmBtn = new NinePatchButton(this.scene, 0, 110 * this.dpr, 90 * this.dpr, 40 * this.dpr, this.key, "button", "存入背包", {
            left: 20,
            top: 20,
            right: 20,
            bottom: 20
        });
        this.confirmBtn.setTextStyle({
            color: "#976400",
            fontSize: 16 * this.dpr,
            fontFamily: Font.DEFULT_FONT
        });
        this.confirmBtn.setInteractive();

        this.add([bg, topline, bottomline, titleimage, tilteName, this.confirmBtn, this.mPropContainer]);
        super.init();
        this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
        // this.setMineSettlePacket(this.testData());
    }

    setMineSettlePacket(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_REWARD_PACKAGE) {
        if (this.mInitialized) {
            this.mPropGrid.setItems(content.items);
            this.mPropGrid.layout();
        }
    }

    destroy() {
        if (this.mPropGrid) this.mPropGrid.destroy();
        if (this.confirmBtn) this.confirmBtn.destroy();
        this.mPropGrid = null;
        this.confirmBtn = null;
        super.destroy();
    }

    private refreshData() {
        const settleData = this.getData("settleData");
        if (settleData) this.setMineSettlePacket(settleData);
    }

    private onSelectItemHandler(data: op_client.ICountablePackageItem) {
    }

    private onConfirmBtnClick(pointer: Phaser.Input.Pointer) {
        if (!this.checkPointerDis(pointer)) return;
        this.emit("hide");
    }

    private checkPointerDis(pointer: Phaser.Input.Pointer) {
        if (!this.mWorld) return true;
        return Math.abs(pointer.downX - pointer.upX) < 10 * this.mWorld.uiRatio * this.mWorld.uiScaleNew &&
            Math.abs(pointer.downY - pointer.upY) < 10 * this.mWorld.uiRatio * this.mWorld.uiScaleNew;
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
    constructor(scene: Phaser.Scene, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.icon = new DynamicImage(scene, 0, 0);
        this.itemCount = this.scene.make.text({
            text: "600",
            style: {
                fontSize: 20,
                fontFamily: Font.DEFULT_FONT
            }
        }, false);
        this.itemCount.setOrigin(0.5, 0);
        this.icon.setOrigin(0, 0);
        this.icon.setScale(this.dpr);
        // this.icon.setSize(50, 50);
        this.itemCount.setPosition(0, this.icon.height);
        this.add(this.icon);
        this.add(this.itemCount);
    }
    public setItemData(data: op_client.ICountablePackageItem) {
        this.itemData = data;
        this.itemCount.setFontSize(this.dpr * 14);
        this.itemCount.text = data.count + "";
        const url = Url.getOsdRes(data.display.texturePath);
        this.icon.load(url, this, () => {
            ///  this.icon.setDisplaySize(33 * this.dpr, 33 * this.dpr);
            this.icon.setScale(33 * this.dpr / this.icon.width);
            this.icon.setPosition(0, 3 * this.dpr);
            this.itemCount.setPosition(this.icon.displayWidth * 0.5, this.icon.x + this.icon.displayHeight + 6 * this.dpr);
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
