import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { EquipUpgradeItem } from "./EquipUpgradeItem";
import { NinePatch } from "../components/nine.patch";
import { op_client } from "pixelpai_proto";

export default class EquipUpgradePanel extends BasePanel {
    private key = "equip_upgrade";
    private commonkey = "common_key";
    private blackBg: Phaser.GameObjects.Graphics;
    private equipItems: EquipUpgradeItem[] = [];
    private bg: NinePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    private content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
    }
    resize(width: number, height: number) {
        super.resize(width, height);
        this.setSize(width, height);
        this.x = width / 2;
        this.y = height / 2;
        this.blackBg.setPosition(-this.x, -this.y);
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.5);
        this.blackBg.fillRect(0, 0, width, height);

    }

    preload() {
        this.addAtlas(this.key, "equip_upgrade/mine_eqpm.png", "equip_upgrade/mine_eqpm.json");
        this.addAtlas(this.commonkey, "common/ui_base.png", "common/ui_base.json");
        super.preload();
    }
    init() {
        this.blackBg = this.scene.make.graphics(undefined, false);
        this.bg = new NinePatch(this.scene, 0, 0, 300 * this.dpr, 300 * this.dpr, this.commonkey, "bg", {
            top: 40,
            bottom: 40
        });
        const posY = -this.bg.height * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: posY, key: this.key, frame: "titlebg" });
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.tilteName = this.scene.make.text({ x: 0, y: posY, text: "装备", style: { font: mfont, color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 8, y: posY + this.dpr * 8, key: this.commonkey, frame: "close" });
        this.tilteName.setStroke("#8F4300", 1);
        this.closeBtn.setInteractive();
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
        this.add([this.blackBg, this.bg, this.closeBtn, this.titlebg, this.tilteName]);
        super.init();
        this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
        const upgradeData = this.getData("upgradeData");
        if (upgradeData) this.setEquipDatas(upgradeData);
        this.setInteractive();
    }

    setEquipDatas(content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MINING_MODE_SHOW_SELECT_EQUIPMENT_PANEL) {
        if (!this.mInitialized) return;
        this.content = content;
        const arr = content.mineEquipments; // this.getEuipDatas();// [content.minePicks, content.minePicks];
        const height = 175 * this.dpr;
        const bgHeight = height * arr.length - (arr.length >= 2 ? 40 * (arr.length - 2) : 0);
        const cellHeight = 155 * this.dpr;
        this.resetPosition(this.bg.width, bgHeight);
        let posY: number = -bgHeight * 0.5 + 100 * this.dpr;
        let index = 0;
        for (const value of arr) {
            value["isblue"] = (index % 2 === 0 ? false : true);
            const item = new EquipUpgradeItem(this.scene, this.dpr, this.key, this.commonkey);
            item.on("reqActive", this.onReqActiveEquipment, this);
            item.on("reqEquiped", this.onReqEquipedEquipment, this);
            this.add(item);
            item.setEquipItems(value);
            item.setTransPosition(0, posY);
            this.equipItems.push(item);
            posY += cellHeight;
            index++;
        }
    }

    setActiveEquipment(equip: op_client.IMiningEquipment) {
        let index = 0;
        for (const value of this.content.mineEquipments) {
            const item = this.equipItems[index];
            let activeIndex = -1;
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < value.mineEquipments.length; i++) {
                const data = value.mineEquipments[i];
                if (data.id === equip.id) {
                    value.mineEquipments[i] = equip;
                    item.refreshEquipData(equip, i);
                    activeIndex = i;
                } else {
                    if (data.selected) data.selected = false;
                }
            }
            if (activeIndex >= 0) {
                item.refreshEquipData(equip, activeIndex);
            }
            index++;
        }
    }

    destroy() {
        if (this.equipItems) {
            for (const item of this.equipItems) {
                item.destroy();
            }
            this.equipItems.length = 0;
        }
        this.equipItems = null;
        this.content = null;
        super.destroy();
    }

    getEuipDatas() {
        const arr = [];
        for (let i = 0; i < 3; i++) {
            const obj = {};
            obj["name"] = i === 0 ? "矿镐" : "矿车";
            obj["items"] = [];
            obj["isblue"] = !(i % 2 === 0);
            for (let j = 0; j < 15; j++) {
                const item = {};
                item["name"] = "矿镐" + j;
                item["penetration"] = 10 + j;
                item["des"] = "文字描述文字描述文字描述文字描述文字描述文字描述文字描述文字描述文字描述文字描述文字描述文字描述";
                item["cost"] = 100 * j;
                item["unlock"] = false;
                obj["items"].push(item);
            }
            arr.push(obj);
        }
        return arr;
    }

    private resetPosition(width: number, height: number) {
        this.bg.resize(width, height);
        const posY = -height * 0.5;
        this.titlebg.setPosition(0, posY);
        this.tilteName.setPosition(0, posY);
        this.closeBtn.setPosition(width * 0.5 - this.dpr * 8, posY + this.dpr * 8);
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onReqActiveEquipment(id: string) {
        this.emit("reqActive", id);
    }

    private onReqEquipedEquipment(id: string) {
        this.emit("reqEquiped", id);
    }
}
