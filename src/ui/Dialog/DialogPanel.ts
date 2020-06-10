import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { NinePatch } from "../components/nine.patch";
import { DynamicImage } from "../components/dynamic.image";
import { Font } from "../../utils/font";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { Handler } from "../../Handler/Handler";
import { op_def, op_client, op_virtual_world, op_gameconfig_01 } from "pixelpai_proto";
import { Url } from "../../utils/resUtil";
export class DialogPanel extends BasePanel {
    public key: string = "commonkey";
    private npcName: Phaser.GameObjects.Text;
    private npcIcon: DynamicImage;
    private content: Phaser.GameObjects.Container;
    private text: Phaser.GameObjects.Text;
    private blackBg: Phaser.GameObjects.Graphics;
    private listItems: NpcDialogueItem[] = [];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.scale = 1;
    }
    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        const cheight = 177 * this.dpr;
        super.resize(width, height);
        this.content.setPosition(width * 0.5, height - cheight / 2);
        this.setSize(width, height);
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.5);
        this.blackBg.fillRoundedRect(0, 0, width, height);
    }

    preload() {
        this.addAtlas(this.key, "common/ui_base.png", "common/ui_base.json");
        super.preload();
    }
    public show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
        this.setDialogData(this.mShowData[0]);
    }
    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        const cheight = 177 * this.dpr;
        this.blackBg = this.scene.make.graphics(undefined, false);
        this.add(this.blackBg);
        this.content = this.scene.make.container({ x: 0 * this.dpr, y: (height - cheight) / 2, width, height: cheight }, false);
        this.content.setSize(width, cheight);
        const bg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "menu_bg_l" });
        bg.scaleY = this.scale;
        bg.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        bg.displayWidth = width;
        bg.displayHeight = cheight;
        const whiteGraphic = this.scene.make.graphics(undefined, false);
        const graphicWidth = width - 30 * this.dpr;
        const graphicHeight = 122 * this.dpr;
        whiteGraphic.setPosition(- graphicWidth >> 1, -graphicHeight * 0.5 + 13 * this.dpr);
        whiteGraphic.clear();
        whiteGraphic.fillStyle(0xffffff, 1);
        whiteGraphic.fillRoundedRect(0, 0, graphicWidth, graphicHeight, 8 * this.dpr);
        this.text = this.scene.make.text({
            x: -graphicWidth * 0.5 + 20 * this.dpr, y: -graphicHeight * 0.5 + 30 * this.dpr, text: "五七二五",
            style: { color: "#000000", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0).setWordWrapWidth(graphicWidth - 35* this.dpr, true);
        const iconPosx = -width * 0.5 + 38 * this.dpr;
        const iconPosy = -cheight * 0.5 + 25 * this.dpr;
        this.npcIcon = new DynamicImage(this.scene, iconPosx, iconPosy - 20 * this.dpr);
        const nameBg = this.scene.make.image({ x: iconPosx + 100 * this.dpr, y: iconPosy, key: this.key, frame: "name_bg" });
        this.npcName = this.scene.make.text({
            x: nameBg.x - (48 * this.dpr), y: nameBg.y, text: "尼古拉斯.赵二",
            style: { fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT }
        }).setOrigin(0, 0.5);

        const closeBtn = new Button(this.scene, this.key, "close_1", "close_1");
        closeBtn.setPosition(width * 0.5 - 30 * this.dpr, -cheight * 0.5 + 10 * this.dpr);
        closeBtn.on("Tap", this.onCloseHandler, this);
        closeBtn.visible = false;
        this.content.add([bg, whiteGraphic, this.text, this.npcIcon, nameBg, this.npcName, closeBtn]);
        bg.setInteractive();
        bg.on("pointerup", this.onNextDialogHandler, this);
        this.add(this.content);
        this.resize(0, 0);
        super.init();
    }

    public setLayoutItems(arr: op_gameconfig_01.IButton[]) {
        const len = arr.length;
        const scaleRadio = (len > 4 ? 2 : 1);
        const height = 177 * this.dpr;
        const width = 295 * this.dpr;
        const cheight = 27 * this.dpr;
        const cwidth = width / scaleRadio;
        let offsetY = 4 * this.dpr;
        if (len === 2) offsetY = 15 * this.dpr;
        else if (len === 3) offsetY = 10 * this.dpr;
        const posX: number = 0;
        const posy: number = (124 * this.dpr - (offsetY + cheight) * (len < 4 ? len : 4) - offsetY) / 2 - 42 * this.dpr;
        for (const item of this.listItems) {
            item.visible = false;
        }
        for (let i = 0; i < len; i++) {
            let item: NpcDialogueItem;
            if (i < this.listItems.length) {
                item = this.listItems[i];
            } else {
                item = new NpcDialogueItem(this.scene, this.dpr, this.scale, this.key);
                this.content.add(item);
                this.listItems.push(item);
                item.setHandler(new Handler(this, this.onItemHandler));
            }
            const x = (width - cwidth) * 0.5 * (i < 4 ? -1 : 1);
            const y = posy + cheight * 0.5 + (cheight + offsetY) * (i % 4);
            item.setItemSize(cwidth, cheight);
            item.setPosition(x, y);
            item.setItemData(arr[i]);
            item.visible = true;
        }
    }

    public setDialogData(data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI | op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        if (data.text && data.text[1])
            this.npcName.text = data.text[1].text;
        if (data.display && data.display[0]) {
            const url = Url.getOsdRes(data.display[0].texturePath);
            this.npcIcon.load(url, this, () => {
                this.npcIcon.displayWidth = 60 * this.dpr;
                this.npcIcon.scaleY = this.npcIcon.scaleX;
            });
        }
        if (data.button && data.button.length > 0) {
            this.setLayoutItems(data.button);
            this.text.visible = false;
        } else {
            for (const item of this.listItems) {
                item.visible = false;
            }
            this.text.text = data.text[0].text;
            this.text.visible = true;
        }
    }
    public update(param?: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI) {
        this.mShowData = param;
        this.setDialogData(param[0]);
    }
    private onItemHandler(item: NpcDialogueItem) {
        for (const temp of this.listItems) {
            temp.select = false;
        }
        item.select = true;
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI | op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.showData[0];
        this.emit("querydialog", data.id, item.itemData.node.id);
    }

    private onNextDialogHandler() {
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI | op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.showData[0];
        this.emit("querydialog", data.id, 0);
    }

    private onCloseHandler() {
        this.emit("hide");
    }
}

class NpcDialogueItem extends Phaser.GameObjects.Container {
    public itemData: op_gameconfig_01.IButton;
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

    public setItemData(data: op_gameconfig_01.IButton) {
        this.itemData = data;
        this.content.text = data.text;
        this.select = false;
    }

    public setHandler(handler: Handler) {
        this.handler = handler;
    }

    public set select(value: boolean) {
        this.selectBg.visible = value;
    }
    public setItemSize(width: number, height: number) {
        super.setSize(width, height);
        this.selectBg.displayWidth = width;
        this.arrImg.x = -width * 0.5 * 0.9;
        this.content.x = this.arrImg.x + 20 * this.dpr * this.zoom;
        // this.removeInteractive();
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    }

    public onClickHandler() {
        if (this.handler) this.handler.runWith(this);
    }
}
