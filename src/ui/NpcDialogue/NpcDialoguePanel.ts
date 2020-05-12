import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { NinePatch } from "../components/nine.patch";
import { DynamicImage } from "../components/dynamic.image";
import { Font } from "../../utils/font";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";

export class NpcDialoguePanel extends BasePanel {
    public key: string = "commonkey";
    private npcName: Phaser.GameObjects.Text;
    private npcIcon: DynamicImage;
    private content: Phaser.GameObjects.Container;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    resize(w: number, h: number) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const zoom = this.mWorld.uiScale;
        const cheight = 180 * this.dpr * zoom;
        super.resize(width, height);
        this.x = width / 2;
        this.y = height / 2;
        this.content.setPosition(0, (height - cheight) / 2);
        this.setSize(width, height);
    }

    preload() {
        this.addAtlas(this.key, "common/ui_base.png", "common/ui_base.json");
        super.preload();
    }
    init() {
        const zoom = this.mWorld.uiScale;
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const cheight = 180 * this.dpr * zoom;
        this.content = this.scene.make.container({ x: 0 * this.dpr * zoom, y: (height - cheight) / 2, width, height: cheight }, false);
        this.content.setSize(width, cheight);
        const bg = new NinePatch(this.scene, 0, 0, width, cheight, this.key, "menu_bg", {
            left: 0,
            top: 27 * this.dpr * zoom,
            bottom: 27 * this.dpr * zoom,
            right: 0
        });
        const whiteGraphic = this.scene.make.graphics(undefined, false);
        const graphicWidth = width - 30 * this.dpr * zoom;
        const graphicHeight = 122 * this.dpr * zoom;
        whiteGraphic.setPosition(- graphicWidth >> 1, -graphicHeight * 0.5 + 15 * this.dpr * zoom);
        whiteGraphic.clear();
        whiteGraphic.fillStyle(0xffffff, 1);
        whiteGraphic.fillRect(0, 0, graphicWidth, graphicHeight);

        const iconPosx = -width * 0.5 + 38 * this.dpr * zoom;
        const iconPosy = -cheight * 0.5 + 26 * this.dpr * zoom;
        this.npcIcon = new DynamicImage(this.scene, iconPosx, iconPosy);
        const nameBg = this.scene.make.image({ x: iconPosx + 100 * this.dpr * zoom, y: iconPosy, key: this.key, frame: "name_bg" });
        this.npcName = this.scene.make.text({
            x: nameBg.x - (48 * this.dpr * zoom), y: nameBg.y, text: "尼古拉斯.赵二",
            style: { fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0, 0.5);

        const closeBtn = new Button(this.scene, this.key, "close_1", "close_1");
        closeBtn.setPosition(width * 0.5, -cheight * 0.5);
        this.content.add([bg, whiteGraphic, this.npcIcon, nameBg, this.npcName, closeBtn]);
        this.add(this.content);
        //  this.content.setScale(zoom);
        closeBtn.on("Tap", this.onCloseHandler, this);
        this.resize(0, 0);
        super.init();
    }

    private onCloseHandler() {
        this.hide();
    }
}

class NpcDialogueItem extends Phaser.GameObjects.Container {
    public itemData: any;
    public content: Phaser.GameObjects.Text;
    public selectBg: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number, key: string) {
        super(scene);
        this.selectBg = this.scene.make.image({ x: 0, y: 0, key, frame: "select_bg" });
        const img = this.scene.make.image({ x: -this.selectBg.width * 0.5, y: 0, key, frame: "arrow_r" });
        this.content = this.scene.make.text({
            x: 0, y: 0, text: "购买物品",
            style: { fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0, 0.5);
        this.add([this.selectBg, img, this.content]);
        this.width = this.selectBg.width;
        this.height = this.selectBg.height;
    }

    public setItemData(data: any) {
        this.itemData = data;
    }

    public set select(value: boolean) {
        this.selectBg.visible = value;
    }
}
