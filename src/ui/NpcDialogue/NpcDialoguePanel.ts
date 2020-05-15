import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { NinePatch } from "../components/nine.patch";
import { DynamicImage } from "../components/dynamic.image";
import { Font } from "../../utils/font";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { Handler } from "../../Handler/Handler";

export class NpcDialoguePanel extends BasePanel {
    public key: string = "commonkey";
    private npcName: Phaser.GameObjects.Text;
    private npcIcon: DynamicImage;
    private content: Phaser.GameObjects.Container;
    private listItems: NpcDialogueItem[] = [];
    private curSelectItem: NpcDialogueItem;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    resize(w: number, h: number) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const zoom = this.mWorld.uiScale;
        const cheight = 177 * this.dpr * zoom;
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
        const cheight = 177 * this.dpr * zoom;
        this.content = this.scene.make.container({ x: 0 * this.dpr * zoom, y: (height - cheight) / 2, width, height: cheight }, false);
        this.content.setSize(width, cheight);
        const bg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "menu_bg_l" });
        bg.scaleY = zoom;
        bg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        bg.displayWidth = width;
        bg.displayHeight = cheight;
        const whiteGraphic = this.scene.make.graphics(undefined, false);
        const graphicWidth = width - 30 * this.dpr * zoom;
        const graphicHeight = 122 * this.dpr * zoom;
        whiteGraphic.setPosition(- graphicWidth >> 1, -graphicHeight * 0.5 + 13 * this.dpr * zoom);
        whiteGraphic.clear();
        whiteGraphic.fillStyle(0xffffff, 1);
        whiteGraphic.fillRoundedRect(0, 0, graphicWidth, graphicHeight, 8 * this.dpr * zoom);

        const iconPosx = -width * 0.5 + 38 * this.dpr * zoom;
        const iconPosy = -cheight * 0.5 + 25 * this.dpr * zoom;
        this.npcIcon = new DynamicImage(this.scene, iconPosx, iconPosy);
        const nameBg = this.scene.make.image({ x: iconPosx + 100 * this.dpr * zoom, y: iconPosy, key: this.key, frame: "name_bg" });
        this.npcName = this.scene.make.text({
            x: nameBg.x - (48 * this.dpr * zoom), y: nameBg.y, text: "尼古拉斯.赵二",
            style: { fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0, 0.5);

        const closeBtn = new Button(this.scene, this.key, "close_1", "close_1");
        closeBtn.setPosition(width * 0.5 - 30 * this.dpr * zoom, -cheight * 0.5 + 10 * this.dpr * zoom);
        closeBtn.on("Tap", this.onCloseHandler, this);
        this.content.add([bg, whiteGraphic, this.npcIcon, nameBg, this.npcName, closeBtn]);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
        this.layoutItem(undefined);
    }

    public layoutItem(arr: string[]) {
        arr = ["聊天", "购买物品","威威"];
        const len = arr.length;
        const scaleRadio = (len > 4 ? 2 : 1);
        const zoom = this.mWorld.uiScale;
        const height = 177 * this.dpr * zoom;
        const width = 295 * this.dpr * zoom;
        const cheight = 27 * this.dpr * zoom;
        const cwidth = width / scaleRadio;
        let offsetY = 4 * this.dpr * zoom;
        if (len === 2) offsetY = 15 * this.dpr * zoom;
        else if (len === 3) offsetY = 10 * this.dpr * zoom;
        const posX: number = 0;
        const posy: number = (124 * this.dpr * zoom - (offsetY + cheight) * (len < 4 ? len : 4) - offsetY) / 2 - 42 * this.dpr * zoom;
        for (let i = 0; i < len; i++) {
            const item = new NpcDialogueItem(this.scene, this.dpr, zoom, this.key);
            const x = (width - cwidth) * 0.5 * (i < 4 ? -1 : 1);
            const y = posy + cheight * 0.5 + (cheight + offsetY) * (i % 4);
            item.setItemSize(cwidth, cheight);
            item.setPosition(x, y);
            item.setItemData(arr[i], new Handler(this, this.onItemHandler));
            this.content.add(item);
        }
    }

    private onItemHandler(item: NpcDialogueItem) {
        if (this.curSelectItem) this.curSelectItem.select = false;
        item.select = true;
        this.curSelectItem = item;
    }

    private onCloseHandler() {
        this.hide();
    }
}

class NpcDialogueItem extends Phaser.GameObjects.Container {
    public itemData: any;
    public content: Phaser.GameObjects.Text;
    public selectBg: Phaser.GameObjects.Image;
    public arrImg: Phaser.GameObjects.Image;
    public dpr: number = 0;
    public zoom: number = 0;
    private handler: Handler;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number, key: string) {
        super(scene);
        this.zoom = zoom;
        this.dpr = dpr;
        this.selectBg = this.scene.make.image({ x: 0, y: 0, key, frame: "select_bg" });
        this.arrImg = this.scene.make.image({ x: -this.selectBg.width * 0.5, y: 0, key, frame: "arrow_r" });
        this.content = this.scene.make.text({
            x: 0, y: 0, text: "购买物品",
            style: { color: "#000000", fontSize: 15 * dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0, 0.5);
        this.add([this.selectBg, this.arrImg, this.content]);
        this.width = this.selectBg.width;
        this.height = this.selectBg.height;
        this.on("pointerdown", this.onClickHandler, this);
    }

    public setItemData(data: any, handler: Handler) {
        this.itemData = data;
        this.content.text = data;
        this.handler = handler;
        this.select = false;
    }

    public set select(value: boolean) {
        this.selectBg.visible = value;
    }
    public setItemSize(width: number, height: number) {
        super.setSize(width, height);
        this.selectBg.displayWidth = width;
        this.arrImg.x = -width * 0.5 * 0.9;
        this.content.x = this.arrImg.x + 20 * this.dpr * this.zoom;
        this.removeInteractive();
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    }

    public onClickHandler() {
        if (this.handler) this.handler.runWith(this);
    }
}
