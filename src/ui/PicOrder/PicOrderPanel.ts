import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { DynamicImage } from "../components/dynamic.image";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/GameScroller";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import { Handler } from "../../Handler/Handler";
import { Url } from "../../utils/resUtil";
import { BBCodeText, NineSlicePatch } from "../../../lib/rexui/lib/ui/ui-components";
import { ProgressBar } from "../../../lib/rexui/lib/ui/progressbar/ProgressBar";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
export class PicOrderPanel extends BasePanel {
    private key = "order_ui";
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    private mGameGrid: GameGridTable;
    private content: Phaser.GameObjects.Container;
    private orderProgressPanel: OrderProgressPanel;
    private goldImageValue: ImageValue;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.5);
        this.mBackground.fillRoundedRect(-this.x, -this.y, w, h);
        this.content.x = w * 0.5;
        this.content.y = h * 0.5;
        this.mGameGrid.resetMask();
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    public show(param?: any) {
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
        this.setInteractive();
        this.addListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "order/order.png", "order/order.json");
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }
    init() {
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.add(this.mBackground);
        const conWdith = 295 * this.dpr;
        const conHeight = 454 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.add(this.content);
        this.bg = new NineSlicePatch(this.scene, 0, 0, conWdith, conHeight, UIAtlasKey.commonKey, "bg", {
            left: 30 * this.dpr,
            top: 30 * this.dpr,
            bottom: 30 * this.dpr,
            right: 30 * this.dpr,
        });
        const posY = -conHeight * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: posY, key: this.key, frame: "title" });
        this.titlebg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.titlebg.y = posY - this.titlebg.height * 0.5 + 20 * this.dpr;
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.tilteName = this.scene.make.text({ x: 0, y: posY - 12 * this.dpr, text: i18n.t("order.title"), style: { font: mfont, color: "#905B06", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.closeBtn = this.scene.make.image({ x: conWdith * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" });
        this.tilteName.setStroke("#8F4300", 1);
        this.tilteName.setResolution(this.dpr);
        this.closeBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.closeBtn.setInteractive();
        this.orderProgressPanel = new OrderProgressPanel(this.scene, 252 * this.dpr, 45 * this.dpr, this.key, this.dpr);
        const tableConfig: GridTableConfig = {
            x: 0,
            y: 0,
            table: {
                width: conWdith - 40 * this.dpr,
                height: conHeight - 110 * this.dpr,
                columns: 1,
                cellWidth: conWdith,
                cellHeight: 70 * this.dpr,
                reuseCellContainer: true,
                tableOX: 19 * this.dpr,
                zoom: this.scale
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new OrderItem(this.scene, this.key, this.dpr);
                    cellContainer.setHandler(new Handler(this, this.onSendHandler), new Handler(this, this.onAcceleHandler));
                }
                cellContainer.setOrderData(item, Math.floor(Math.random() * 3.3) + 1);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.goldImageValue = new ImageValue(this.scene, 50 * this.dpr, 14 * this.dpr, this.dpr);
        this.goldImageValue.setFrameValue("", this.key, "order_precious");
        this.goldImageValue.setTextStyle({
            color: "#144B99", fontSize: 10 * this.dpr, bold: true,
            stroke: "#144B99",
            strokeThickness: 1 * this.dpr,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: "#144B99",
                blur: 4,
                stroke: true,
                fill: true
            },
        });
        this.goldImageValue.y = conHeight * 0.5 - 40 * this.dpr;
        this.content.add([this.bg, this.closeBtn, this.titlebg, this.tilteName, this.orderProgressPanel, this.mGameGrid, this.goldImageValue]);
        this.resize();
        super.init();
    }

    public setOrderDatas(datas) {
        const arr = new Array<any>(50);
        this.mGameGrid.setItems(arr);
        this.goldImageValue.setText("1/10");
        this.goldImageValue.resetSize();
        this.goldImageValue.x = this.content.width * 0.5 - this.goldImageValue.width * 0.5 - 20 * this.dpr;
    }

    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onSendHandler() {

    }

    private onAcceleHandler() {

    }
}

class OrderItem extends Phaser.GameObjects.Container {
    private orderData: any;
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private headbg: Phaser.GameObjects.Image;
    private headIcon: DynamicImage;
    private refreshBtn: Button;
    private sendBtn: Button;
    private sendTitle: Phaser.GameObjects.Text;
    private acceleBtn: Button;
    private acceleSpend: ImageValue;
    private calcuTime: ImageValue;
    private materialItems: MaterialItem[];
    private imageValues: ImageValue[];
    private orderRewards: OrderRewardItem[];
    private deliverybg: Phaser.GameObjects.Image;
    private acceleHandler: Handler;
    private sendHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = scene.make.image({ key, frame: "order_ordinary_bg" });
        this.add(this.bg);
        this.setSize(this.bg.width, this.bg.height);
        this.headbg = scene.make.image({ key, frame: "order_ordinary_head_bg" });
        this.add(this.headbg);
        this.headbg.x = -this.width * 0.5 + this.headbg.width * 0.5 + 10 * dpr;
        this.headIcon = new DynamicImage(scene, this.headbg.x, 0);
        this.add(this.headIcon);
        this.refreshBtn = new Button(scene, this.key, "order_delete_bg", "order_delete_bg");
        this.refreshBtn.x = this.width * 0.5 - this.refreshBtn.width * 0.5;
        this.refreshBtn.y = -this.headbg * 0.5 + this.refreshBtn.height * 0.5;
        this.add(this.refreshBtn);
        const deleteicon = scene.make.image({ key, frame: "order_delete" });
        this.refreshBtn.add(deleteicon);
        this.sendBtn = new Button(scene, UIAtlasKey.commonKey, "order_green_butt", "order_green_butt", i18n.t("order.send"));
        this.sendBtn.x = this.width * 0.5 - this.sendBtn.width * 0.5 - 10 * dpr;
        this.add(this.sendBtn);
        this.sendTitle = scene.make.text({ x: this.width * 0.5 - 10 * dpr, y: 0, text: i18n.t("order.deliverying"), style: { color: "#ffffff", fontSize: 8 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.sendTitle.setOrigin(1, 0.5);
        this.acceleBtn = new Button(scene, UIAtlasKey.commonKey, "order_red_butt", "order_red_butt", i18n.t("order.ACCELERATE"));
        this.acceleBtn.x = 20 * dpr;
        this.acceleBtn.y = -10 * dpr;
        this.acceleSpend = new ImageValue(scene, 30 * dpr, 10 * dpr, this.dpr);
        this.acceleSpend.x = this.acceleBtn.x;
        this.acceleSpend.y = this.acceleBtn.y - this.acceleBtn.height * 0.5 - 10 * dpr;
        this.add(this.acceleSpend);
        this.calcuTime = new ImageValue(scene, 30 * dpr, 10 * dpr, dpr);
        this.calcuTime.setTextStyle({
            color: "#144B99", fontSize: 10 * dpr, bold: true,
            stroke: "#144B99",
            strokeThickness: 1 * this.dpr,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: "#144B99",
                blur: 4,
                stroke: true,
                fill: true
            },
        });
        this.calcuTime.x = this.acceleBtn.x;
        this.calcuTime.y = this.acceleBtn.y + this.acceleBtn.height * 0.5 + 10 * dpr;
        this.sendBtn.on(CoreUI.MouseEvent.Tap, this.onSendHandler, this);
        this.acceleBtn.on(CoreUI.MouseEvent.Tap, this.onAcceleHandler, this);
    }

    public setHandler(accele: Handler, send: Handler) {
        this.acceleHandler = accele;
        this.sendHandler = send;
    }
    public setOrderData(data: any, type: number) {
        this.orderData = data;
        this.hideAllElement();
        // const url = Url.getOsdRes("");
        // this.headIcon.load(url, this, () => {

        // });
        if (type === 1) {
            this.deliveryState(data);
        } else if (type === 2) {
            this.deliveryingState(data);
        } else if (type === 3) {
            this.rewardState(data);
        } else if (type === 4) {
            this.cooldownState(data);
        }
    }

    private onAcceleHandler() {
        if (this.acceleHandler) this.acceleHandler.run();
    }

    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.run();
    }

    private deliveryState(data) {
        const gold = 1;
        this.headbg.setFrame(gold === 1 ? "order_ordinary_head_bg" : "order_precious_head_bg");
        this.refreshBtn.visible = true;
        this.refreshBtn.setInteractive();
        this.refreshBtn.setFrameNormal(gold === 1 ? "order_delete_bg" : "order_precious_delete_bg");
        let offsetpos = -this.width * 0.5 + 50 * this.dpr;
        let isenough = true;
        for (let i = 0; i < 4; i++) {
            let item: MaterialItem;
            if (i < this.materialItems.length) {
                item = this.materialItems[i];
            } else {
                item = new MaterialItem(this.scene, this.key, this.dpr);
                this.add(item);
                this.materialItems.push(item);
            }
            item.setMaterialData();
            item.x = offsetpos + i * item.width * 0.5;
            offsetpos += item.width + 10 * this.dpr;
            item.y = -20 * this.dpr;
            item.visible = true;
            isenough = true;
        }
        if (isenough) {
            this.sendBtn.setFrameNormal("order_green_butt");
            this.sendBtn.setInteractive();
            this.sendBtn.setText(i18n.t("order.send"));
        } else {
            this.sendBtn.setFrameNormal("order_gray_butt");
            this.sendBtn.disInteractive();
            this.sendBtn.setText(i18n.t("order.send"));
        }
        offsetpos = -this.width * 0.5 + 60 * this.dpr;
        for (let i = 0; i < 4; i++) {
            let item: ImageValue;
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new ImageValue(this.scene, 30 * this.dpr, 13 * this.dpr, this.dpr);
                this.add(item);
                this.imageValues.push(item);
            }
            item.setFrameValue("x1000", UIAtlasKey.commonKey, "iv_coin");
            item.setTextStyle({ color: gold === 1 ? "#2154BD" : "#ffffff" });
            item.x = offsetpos + i * item.width * 0.5;
            offsetpos += item.width + 10 * this.dpr;
            item.y = this.height * 0.5 - item.height - 5 * this.dpr;
            item.visible = true;
        }
    }

    private deliveryingState(data) {
        if (!this.deliverybg) {
            this.deliverybg = this.scene.make.image({ key: this.key, frame: "order_transport" });
            this.addAt(this.deliverybg, 1);
        } else this.deliverybg.visible = true;
        this.headbg.setFrame("order_ordinary_head_bg");
        this.refreshBtn.visible = true;
        this.refreshBtn.setInteractive();
        this.refreshBtn.setFrameNormal("order_delete_bg");
        this.sendTitle.visible = true;
        this.calcuTime.setFrameValue("09:42", this.key, "order_time");
        this.calcuTime.resetSize();
        this.calcuTime.x = this.width * 0.5 - this.calcuTime.width * 0.5;
        this.calcuTime.y = -this.height * 0.5 + this.calcuTime.height * 0.5 + 10 * this.dpr;
        let offsetpos = -this.width * 0.5 + 60 * this.dpr;
        for (let i = 0; i < 4; i++) {
            let item: ImageValue;
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new ImageValue(this.scene, 30 * this.dpr, 13 * this.dpr, this.dpr);
                this.add(item);
                this.imageValues.push(item);
            }
            item.setFrameValue("x1000", UIAtlasKey.commonKey, "iv_coin");
            item.setTextStyle({ color: "#2154BD" });
            item.x = offsetpos + i * item.width * 0.5;
            offsetpos += item.width + 10 * this.dpr;
            item.y = this.height * 0.5 - item.height - 5 * this.dpr;
            item.visible = true;
        }
    }

    private rewardState(data) {
        this.headbg.setFrame("order_ordinary_head_bg");
        this.refreshBtn.visible = true;
        this.refreshBtn.setInteractive();
        this.refreshBtn.setFrameNormal("order_delete_bg");
        this.sendBtn.visible = true;
        this.sendBtn.setInteractive();
        this.sendBtn.setFrameNormal("order_yellow_butt");
        this.sendBtn.setText(i18n.t("order.receive"));
        let offsetpos = -this.width * 0.5 + 60 * this.dpr;
        for (let i = 0; i < 4; i++) {
            let item: OrderRewardItem;
            if (i < this.orderRewards.length) {
                item = this.orderRewards[i];
            } else {
                item = new OrderRewardItem(this.scene, this.key, this.dpr);
                this.add(item);
                this.orderRewards.push(item);
            }
            item.x = offsetpos + i * item.width * 0.5;
            offsetpos += item.width + 20 * this.dpr;
            item.y = -20 * this.dpr;
            item.visible = true;
            item.setItemData();
        }

    }

    private cooldownState(data) {
        this.headbg.setFrame("order_unknown_head");
        this.refreshBtn.visible = false;
        this.refreshBtn.disInteractive();
        this.acceleBtn.visible = true;
        this.acceleBtn.setInteractive();
        this.calcuTime.x = this.acceleBtn.x;
        this.calcuTime.y = this.acceleBtn.y + this.acceleBtn.height * 0.5 + 10 * this.dpr;
        this.calcuTime.setText("09:42");
    }
    private hideAllElement() {
        this.sendBtn.visible = false;
        this.sendBtn.disInteractive();
        this.sendTitle.visible = false;
        this.acceleBtn.visible = false;
        this.acceleBtn.disInteractive();
        this.acceleSpend.visible = false;
        this.calcuTime.visible = false;
        if (this.deliverybg) this.deliverybg.visible = false;
        for (const item of this.materialItems) {
            item.visible = false;
        }
        for (const item of this.orderRewards) {
            item.visible = false;
        }
        for (const item of this.imageValues) {
            item.visible = false;
        }
    }
}

class MaterialItem extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private icon: DynamicImage;
    private value: BBCodeText;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = scene.make.image({ key, frame: "order_demand_icon" });
        this.setSize(this.bg.width, this.bg.height);
        this.icon = new DynamicImage(scene, 0, -5 * dpr);
        this.value = new BBCodeText(this.scene, 0, -10 * dpr, "60/30", {
            color: "#0",
            fontSize: 10 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        });
    }

    public setMaterialData() {

    }
}

class ImageValue extends Phaser.GameObjects.Container {
    private dpr: number;
    private icon: DynamicImage;
    private value: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.icon = new DynamicImage(scene, 0, 0);
        this.value = scene.make.text({ x: 0, y: 0, text: "10", style: { color: "#ffffff", fontSize: 8 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0, 0.5);
    }
    public setFrameValue(text: string, key: string, frame: string) {
        this.icon.setTexture(key, frame);
        this.icon.scaleY = this.icon.displayHeight / this.height;
        this.icon.scaleX = this.icon.scaleY;
        this.value.text = text;
        this.resetPosition();
    }

    public setUrlValue(text: string, url: string) {
        this.value.text = text;
        const osurl = Url.getOsdRes(url);
        this.icon.load(osurl, this, () => {
            this.icon.scaleY = this.icon.displayHeight / this.height;
            this.icon.scaleX = this.icon.scaleY;
            this.resetPosition();
        });
    }

    public setText(tex: string) {
        this.value.text = tex;
    }
    public setTextStyle(style: object) {
        this.value.setStyle(style);
    }
    public setShadow(x?: number, y?: number, color?: string, blur?: number, shadowStroke?: boolean, shadowFill?: boolean) {
        this.value.setShadow(x, y, color, blur, shadowStroke, shadowFill);
    }
    public setStroke(color: string, thickness: number) {
        this.value.setStroke(color, thickness);
    }
    public resetSize() {
        const width = this.icon.displayWidth + this.value.width;
        this.setSize(width, this.height);
        this.resetPosition();
    }
    private resetPosition() {
        this.icon.x = -this.width * 0.5 + this.icon.displayWidth * 0.5;
        this.value.x = this.icon.x + this.icon.displayWidth * 0.5 + 10 * this.dpr;
    }
}

class OrderRewardItem extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private icon: Phaser.GameObjects.Image;
    private text: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.bg = scene.make.image({ key, frame: "order_reward" });
        this.setSize(this.bg.width, this.bg.height);
        this.icon = new DynamicImage(scene, 0, 0);
        this.text = scene.make.text({ x: 0, y: this.bg.height * 0.5 + 20 * dpr, text: "10", style: { color: "#2154BD", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.text.setOrigin(0.5);
        this.add([this.bg, this.icon, this.text]);
    }

    public setItemData() {
        this.text.text = "金币*100000";
    }
}

class OrderProgressPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private progress: ProgressBar;
    private progressItems: OrderProgressItem[] = [];
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.key = key;
        const barConfig = {
            x: 0 * dpr / 2,
            y: 15 * dpr,
            width: 251 * dpr,
            height: 11 * dpr,
            background: {
                x: 0,
                y: 0,
                width: 251 * dpr,
                height: 11 * dpr,
                config: {
                    top: 0 * dpr,
                    left: 7 * dpr,
                    right: 7 * dpr,
                    bottom: 0 * dpr,
                },
                key,
                frame: "order_progress_bottom"
            },
            bar: {
                x: 0,
                y: 0,
                width: 251 * dpr,
                height: 11 * dpr,
                config: {
                    top: 0 * dpr,
                    left: 7 * dpr,
                    right: 7 * dpr,
                    bottom: 0 * dpr,
                },
                key,
                frame: "order_progress_top"
            },
            dpr,
            textConfig: undefined
        };
        this.progress = new ProgressBar(scene, barConfig);
    }

    public setProgressDatas() {
        const len = 4;
        for (let i = 0; i < len; i++) {
            const prevalue = Math.floor(100 * (i + 1) / len);
            let item: OrderProgressItem;
            if (i < this.progressItems.length) {
                item = this.progressItems[i];
            } else {
                item = new OrderProgressItem(this.scene, 0, 0, this.key, this.dpr);
                this.add(item);
                this.progressItems.push(item);
            }
            item.x = -this.width * 0.5 + this.width * (i + 1) / len;
        }
    }
}
class OrderProgressItem extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private icon: Phaser.GameObjects.Image;
    private text: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.bg = scene.make.image({ key, frame: "order_progress_unfinished" });
        this.icon = new DynamicImage(scene, 0, 0);
        this.text = scene.make.text({ x: 0, y: this.bg.height * 0.5 + 20 * dpr, text: "10", style: { color: "#2154BD", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.text.setOrigin(0.5);
        this.add([this.bg, this.icon, this.text]);
    }

    public setItemData() {

    }
}
