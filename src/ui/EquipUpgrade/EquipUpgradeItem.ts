import { Font } from "../../utils/font";
import GridTable from "../../../lib/rexui/lib/ui/gridtable/GridTable";
import { DynamicImage } from "../components/dynamic.image";
import { Url } from "../../utils/resUtil";
import { Logger } from "../../utils/log";
import { op_client } from "pixelpai_proto";
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
    private btnName: Phaser.GameObjects.Text;
    private unlockCondition: Phaser.GameObjects.Text;
    private haveEquiped: boolean = false;

    private curEquipItem: EquipItemCell;
    constructor(scene: Phaser.Scene, dpr: number, key: string, commonKey: string) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.commonKey = commonKey;
        this.create();
    }
    setEquipItems(data: op_client.IMiningEquipmenetArray) {
        const name = data.equipmentType;
        const items = data.mineEquipments;
        this.titleName.text = name;
        let index = 0;
        for (const item of items) {
            if (item.selected) {
                this.haveEquiped = true;
                break;
            }
            index++;
        }
        this.gridTable.setItems(items);
        this.gridTable.layout();
        if (this.haveEquiped)
            this.gridTable.setT((index + 1) / items.length);
        this.setBgTexture(data["isblue"]);
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

    refreshEquipData(data: op_client.IMiningEquipment, index: number) {
        this.gridTable.items[index] = data;
        this.gridTable.refresh();
        this.gridTable.setT((index + 1) / this.gridTable.items.length);
    }

    destroy() {
        if (this.unlockbtn) this.unlockbtn.off("pointerup", this.onUnlockEquipHandler, this);
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

    private setBgTexture(isblue: boolean) {
        const topName = !isblue ? "topbg" : "topbg1";
        const bottombg = !isblue ? "bottombg" : "bottombg1";
        const fontColor = !isblue ? "#8F4300" : "#0867AE";
        this.topbg.setTexture(this.key, topName);
        this.bottombg.setTexture(this.key, bottombg);
        this.titleName.setColor(fontColor).setStroke(fontColor, 1);
        this.equipName.setColor(fontColor).setStroke(fontColor, 1);
        this.penetrationText.setColor(fontColor).setStroke(fontColor, 1);

    }

    private create() {
        this.bg = this.scene.make.image({ x: 0, y: -21 * this.dpr, key: this.key, frame: "bg1" });
        this.topbg = this.scene.make.image({ x: 0, y: -61 * this.dpr, key: this.key, frame: "topbg" });
        this.titleName = this.scene.make.text({ x: 0, y: this.topbg.y + 0 * this.dpr, text: "矿镐", style: { blod: true, color: "#8F4300", fontSize: 14 * this.dpr, font: this.getBoldFont(14 * this.dpr) } }).setOrigin(0.5, 0.5);
        this.bottombg = this.scene.make.image({ x: 0, y: 42 * this.dpr, key: this.key, frame: "bottombg" });
        this.equipName = this.scene.make.text({ x: -120 * this.dpr, y: 15 * this.dpr, text: "精铁镐", style: { color: "#8F4300", fontSize: 14 * this.dpr, font: this.getBoldFont(14 * this.dpr) } });
        this.penetrationText = this.scene.make.text({ x: -60 * this.dpr, y: 16 * this.dpr, text: "穿透力:10", style: { color: "#8F4300", fontSize: 12 * this.dpr, fontFamily: Font.DEFULT_FONT } });
        this.equipDes = this.scene.make.text({ x: -120 * this.dpr, y: 35 * this.dpr, text: "描述文字", style: { color: "#000000", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT, wordWrap: { width: 130 * this.dpr, useAdvancedWrap: true } } });
        this.equipDes.setStroke("#000000", 1);
        this.add([this.bg, this.topbg, this.bottombg, this.titleName, this.equipName, this.penetrationText, this.equipDes]);
        this.createGridTable();
        this.createBtn();
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
                const scene = cell.scene, item: op_client.IMiningEquipment = cell.item;
                const index = cell.index;
                if (cellContainer === null) {
                    cellContainer = new EquipItemCell(scene, this.dpr, this.key);
                    this.mScrollContainer.add(cellContainer);
                }
                cellContainer.setData({ item });
                cellContainer.setItemData(item, index);
                if (this.curEquipItem == null) {
                    if (this.haveEquiped) {
                        if (item.selected) this.onSelectItemHandler(cellContainer);
                    } else {
                        this.onSelectItemHandler(cellContainer);
                    }
                }
                // Logger.getInstance().log(item);
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
        // Logger.getInstance().log(cell.itemData);
        if (this.curEquipItem) this.curEquipItem.setSelect(false);
        const data = cell.itemData;
        this.penetrationText.text = data.buffDisplayNames[0];
        this.equipDes.text = data.description;
        this.equipName.text = data.name;
        this.costNum.text = data.price + "";
        this.curEquipItem = cell;
        if (data.owned) this.unlockbtn.visible = false;
        else this.unlockbtn.visible = true;
        if (data.qualified) {
            this.unlockCondition.visible = false;
            this.unlockbtn.setInteractive();
        } else if (!data.owned) {
            this.unlockCondition.visible = true;
            this.unlockCondition.text = data.conditionDisplayNames[0];
            this.unlockbtn.disableInteractive();
        }
        if (data.price == null) {
            this.costNum.visible = false;
            this.diamondIcon.visible = false;
            this.btnName.setPosition(0, 0 * this.dpr);
        } else {
            this.costNum.visible = true;
            this.diamondIcon.visible = true;
            this.btnName.setPosition(0, 6 * this.dpr);
        }
        cell.setSelect(true);
        this.curEquipItem = cell;
        if (data.owned && !data.selected) this.emit("reqEquiped", data.id);
    }
    private onUnlockEquipHandler() {
        this.emit("reqActive", this.curEquipItem.itemData.id);
    }

    private createBtn() {
        this.unlockCondition = this.scene.make.text({ x: 0, y: -26 * this.dpr, text: "解锁条件", style: { color: "#000000", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.unlockbtn = this.scene.make.container(undefined, false);
        const btnBg = this.scene.make.image({ x: 0, y: 0, key: this.commonKey, frame: "button" });
        this.diamondIcon = this.scene.make.image({ x: -15 * this.dpr, y: -8 * this.dpr, key: this.commonKey, frame: "test_diamond" });
        this.costNum = this.scene.make.text({ x: 0, y: -8 * this.dpr, text: "1000", style: { color: "#ffffff", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0, 0.5);
        this.btnName = this.scene.make.text({ x: 0, y: 6 * this.dpr, text: "立即解锁", style: { color: "#8F4300", fontSize: 13 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0.5);
        this.costNum.setStroke("#ffffff", 1);
        this.btnName.setStroke("#8F4300", 1);
        this.unlockCondition.setStroke("#000000", 1);
        this.unlockbtn.setPosition(70 * this.dpr, 48 * this.dpr);
        this.unlockbtn.setSize(btnBg.width, btnBg.height);
        this.unlockbtn.add([this.unlockCondition, btnBg, this.diamondIcon, this.costNum, this.btnName]);
        btnBg.setInteractive();
        btnBg.on("pointerup", this.onUnlockEquipHandler, this);
        this.add(this.unlockbtn);
    }

    private getBoldFont(size: number) {
        const font = `bold ${size}px Source Han Sans`;
        return font;
    }

}

class EquipItemCell extends Phaser.GameObjects.Container {
    public itemData: op_client.IMiningEquipment;
    public index: number = 0;
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

    public setItemData(data: op_client.IMiningEquipment, index: number) {
        this.itemData = data;
        this.index = index;
        const url = Url.getOsdRes(data.display.texturePath);// "resources/test/test_equip.png";// Url.getOsdRes(data.display.texturePath);
        this.equipIcon.load(url, this, () => {
            // this.equipIcon.setScale(22 * this.dpr / this.equipIcon.width);
            // this.equipIcon.setDisplaySize(22 * this.dpr, 22 * this.dpr);
            this.equipIcon.setPosition(15 * this.dpr, 0 * this.dpr);
        });
        this.setEquiped(data.selected, data.owned);
        this.setSelect(this.isSelect);
    }

    public setSelect(isSelect: boolean) {
        this.isSelect = isSelect;
        let bgName = "equipbg";
        if (!isSelect) {
            if (this.isUnlock) bgName = "equipbg2";
            else bgName = "equipbg1";
        }
        this.bg.setTexture(this.key, bgName);
    }

    private setEquiped(isequiped: boolean, unlock: boolean) {
        this.isUnlock = unlock;
        this.unlock.visible = false;
        if (isequiped) {
            this.isUnlock = true;
            this.unlock.visible = true;
            this.unlock.setTexture(this.key, "ok");
        } else if (!this.isUnlock) {
            this.unlock.visible = true;
            this.unlock.setTexture(this.key, "lock");
        }
    }

    private create() {
        this.bg = this.scene.make.image({ x: 0, y: -10 * this.dpr, key: this.key, frame: "equipbg" }).setOrigin(0, 0);
        this.equipIcon = new DynamicImage(this.scene, 15 * this.dpr, 0 * this.dpr).setOrigin(0, 0);
        this.unlock = this.scene.make.image({ x: 30 * this.dpr, y: -10 * this.dpr, key: this.key, frame: "lock" }).setOrigin(0, 0);
        this.add([this.bg, this.equipIcon, this.unlock]);
    }
}
