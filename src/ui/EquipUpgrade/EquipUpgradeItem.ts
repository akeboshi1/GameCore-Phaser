import { Font } from "../../utils/font";
import GridTable from "../../../lib/rexui/lib/ui/gridtable/GridTable";
import { DynamicImage } from "../components/dynamic.image";
import { Url } from "../../utils/resUtil";
import { Logger } from "../../utils/log";
export class EquipUpgradeItem extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private topbg: Phaser.GameObjects.Image;
    private bottombg: Phaser.GameObjects.Image;
    private unlockbtn: Phaser.GameObjects.Container;
    private titleName: Phaser.GameObjects.Text;
    private equipName: Phaser.GameObjects.Text;
    private penetrationText: Phaser.GameObjects.Text;
    private gridTable: GridTable;
    private mScrollContainer: Phaser.GameObjects.Container;
    private equipDes: Phaser.GameObjects.Text;

    private dpr: number;
    private key: string;
    private commonKey: string;
    private diamondIcon: Phaser.GameObjects.Image;
    private costNum: Phaser.GameObjects.Text;
    private curEquipItem: EquipItemCell;
    constructor(scene: Phaser.Scene, dpr: number, key: string, commonKey: string) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.commonKey = commonKey;
        this.create();
    }
    setEquipItems(data: any) {
        const name = data["name"];
        const items = data["items"];
        this.titleName.text = name;
        this.gridTable.setItems(items);
        this.gridTable.layout();
    }

    setTransPosition(x: number, y: number) {
        this.setPosition(x, y);
        const w = this.scene.cameras.main.width, h = this.scene.cameras.main.height;
        const posX = w * 0.5 + this.x + 0 * this.dpr;
        const posY = h * 0.5 + this.y + -20 * this.dpr;
        this.gridTable.x = posX;
        this.gridTable.y = posY;
        this.mScrollContainer.setPosition(-posX, -posY);
    }

    destroy() {
        super.destroy();
        if (this.gridTable) this.gridTable.destroy();
        this.bg = null;
        this.topbg = null;
        this.bottombg = null;
        this.gridTable = null;
        this.titleName = null;
        this.equipName = null;
        this.penetrationText = null;
        this.equipDes = null;
        this.unlockbtn = null;
        this.costNum = null;
        this.diamondIcon = null;
        this.curEquipItem = null;
    }

    private create() {
        this.bg = this.scene.make.image({ x: 0, y: -21 * this.dpr, key: this.key, frame: "bg1" });
        this.topbg = this.scene.make.image({ x: 0, y: -61 * this.dpr, key: this.key, frame: "topbg" });
        this.titleName = this.scene.make.text({ x: 0, y: this.topbg.y + 0 * this.dpr, text: "矿镐", style: { color: "#976400", fontSize: 14 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.bottombg = this.scene.make.image({ x: 0, y: 42 * this.dpr, key: this.key, frame: "bottombg" });
        this.equipName = this.scene.make.text({ x: -120 * this.dpr, y: 15 * this.dpr, text: "精铁镐", style: { color: "#976400", fontSize: 14 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.penetrationText = this.scene.make.text({ x: -60 * this.dpr, y: 16 * this.dpr, text: "穿透力:10", style: { color: "#976400", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.equipDes = this.scene.make.text({ x: -120 * this.dpr, y: 35 * this.dpr, text: "描述文字", style: { color: "#976400", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT, wordWrap: { width: 130 * this.dpr, useAdvancedWrap: true } } });
        this.add([this.bg, this.topbg, this.bottombg, this.titleName, this.equipName, this.penetrationText, this.equipDes]);
        this.createBtn();
        this.createGridTable();
    }

    private createGridTable() {
        this.mScrollContainer = this.scene.make.container(undefined, false);
        this.mScrollContainer.setPosition(0, -2 * this.dpr);
        const propFrame = this.scene.textures.getFrame(this.key, "equipbg");
        const capW = (propFrame.width + 10 * this.dpr);
        const capH = (propFrame.height + 30 * this.dpr);
        this.gridTable = new GridTable(this.scene, {
            x: 0,
            y: 0,
            scrollMode: 1,
            background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            table: {
                width: 260 * this.dpr,
                height: 60 * this.dpr,
                columns: 1,
                cellWidth: capW,
                cellHeight: capH,
                reuseCellContainer: true,
            },
            clamplChildOY: true,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new EquipItemCell(scene, this.dpr, this.key);
                    this.mScrollContainer.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setItemData(item);
                Logger.getInstance().log(item);
                return cellContainer;
            },
        });

        this.gridTable.layout();
        this.gridTable.on("cell.1tap", (cell) => {
            this.onSelectItemHandler(cell);
        });

        this.add(this.mScrollContainer);
    }

    private onSelectItemHandler(cell: EquipItemCell) {
        Logger.getInstance().log(cell.itemData);
        const data = cell.itemData;
        this.penetrationText.text = "穿透力:" + data["penetration"];
        this.equipDes.text = data["des"];
        this.equipName.text = data["name"];
        this.costNum.text = data["cost"];
        this.curEquipItem = cell;
    }

    private onUnlockEquipHandler() {

    }

    private createBtn() {
        this.unlockbtn = this.scene.make.container(undefined, false);
        const btnBg = this.scene.make.image({ x: 0, y: 0, key: this.commonKey, frame: "button" });
        this.diamondIcon = this.scene.make.image({ x: -15 * this.dpr, y: -8 * this.dpr, key: this.commonKey, frame: "test_diamond" });
        this.costNum = this.scene.make.text({ x: 0, y: -8 * this.dpr, text: "1000", style: { color: "#976400", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        const btnName = this.scene.make.text({ x: 0, y: 4 * this.dpr, text: "立即解锁", style: { color: "#976400", fontSize: 14 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.unlockbtn.setPosition(70 * this.dpr, 42 * this.dpr);
        this.unlockbtn.add([btnBg, this.diamondIcon, this.costNum, btnName]);
        this.unlockbtn.on("pointerup", this.onUnlockEquipHandler, this);
        this.add(this.unlockbtn);
    }

}

class EquipItemCell extends Phaser.GameObjects.Container {
    public itemData: any;
    private dpr: number;
    private key: string;
    private bg: Phaser.GameObjects.Image;
    private unlock: Phaser.GameObjects.Image;
    private equipIcon: DynamicImage;
    private isSelect: boolean = false;
    private isUnlock: boolean = false;
    constructor(scene: Phaser.Scene, dpr: number, key: string) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.create();
    }

    public setItemData(data: any) {
        this.itemData = data;
        const url = "resources/test/test_equip.png";// Url.getOsdRes(data.display.texturePath);
        this.equipIcon.load(url, this, () => {
            this.equipIcon.setDisplaySize(22 * this.dpr, 22 * this.dpr);
            this.equipIcon.setPosition(15 * this.dpr, 0 * this.dpr);
           // this.unlock.setPosition(15 * this.dpr, 0 * this.dpr);
        });
        const unlock = data["unlock"];
        this.isUnlock = unlock;
        this.setSelect(false);
    }

    public setSelect(isSelect: boolean) {
        this.isSelect = isSelect;
        const unlock = this.isUnlock;
        let bgName = "equipbg1";
        if (this.isSelect) bgName = "equipbg";
        else if (unlock) bgName = "equipbg2";
        this.bg.setTexture(this.key, bgName);
        this.unlock.setTexture(this.key, unlock ? "ok" : "lock");
    }

    private create() {
        this.bg = this.scene.make.image({ x: 0, y: -10 * this.dpr, key: this.key, frame: "equipbg" }).setOrigin(0, 0);
        this.equipIcon = new DynamicImage(this.scene, 15 * this.dpr, 0 * this.dpr).setOrigin(0, 0);
        this.unlock = this.scene.make.image({ x: 30 * this.dpr, y: -10 * this.dpr, key: this.key, frame: "lock" }).setOrigin(0, 0);
        this.add([this.bg, this.equipIcon, this.unlock]);
    }
}
