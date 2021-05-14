import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText, ProgressBar } from "apowophaserui";
import { AlertView, DynamicImage, ItemInfoTips, Render, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasKey, UIAtlasName } from "../../../res";
import { Font, Handler, i18n, Logger, Url } from "utils";
import { ICountablePackageItem } from "../../../structure";
import { DynamicImageValue, ImageValue } from "..";
import { PicaNewOrderItem } from "./PicaNewOrderItem";
import { PicaItemTipsPanel } from "../SinglePanel/PicaItemTipsPanel";
export class PicaNewOrderContentPanel extends Phaser.GameObjects.Container {
    private mGameGrid: GameGridTable;
    private orderProgressPanel: OrderProgressPanel;
    private progressData: any;
    private dpr: number;
    private zoom: number;
    private send: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
    }

    resize(width: number, height: number) {
        this.setSize(width, height);
    }
    refreshMask() {
        this.mGameGrid.resetMask();
    }
    init() {

        this.orderProgressPanel = new OrderProgressPanel(this.scene, this.width, 45 * this.dpr, UIAtlasName.order_new, this.dpr, this.zoom);
        this.orderProgressPanel.y = -this.height * 0.5 + 20 * this.dpr;
        this.orderProgressPanel.setHandler(new Handler(this, this.onProgressHandler));
        const conWdith = 278 * this.dpr;
        const tableConfig = {
            x: 0,
            y: 15 * this.dpr,
            table: {
                width: conWdith,
                height: this.height - 110 * this.dpr,
                columns: 1,
                cellWidth: conWdith - 40 * this.dpr,
                cellHeight: 86 * this.dpr,
                reuseCellContainer: true,
                zoom: this.scale
            },
            scrollMode: 0,
            clamplChildOY: false,
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new PicaNewOrderItem(scene, this.dpr);
                    cellContainer.setHandler(new Handler(this, this.onNewOrderItemHandler));
                    cellContainer.on("pointerdown", this.onClickDownHandler, this);
                }
                cellContainer.setOrderData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.orderProgressPanel.visible = false;
        this.add([this.orderProgressPanel, this.mGameGrid]);
    }

    public setOrderDataList(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST
        this.orderProgressPanel.visible = true;
        const orders = content.orders;
        this.mGameGrid.setItems(orders);
    }

    public setOrderProgress(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        this.progressData = content;
        this.orderProgressPanel.setProgressDatas(content);
    }

    public setHandler(send: Handler) {
        this.send = send;
    }

    private onProgressHandler(index: number, item: OrderProgressItem) {
        if (!this.progressData) return;
        const data = item.progressData;
        if (!data.received) {
            if (data.targetValue <= this.progressData.currentProgressValue) {
                // this.render.renderEmitter(ModuleName.PICAORDER_NAME + "_questreward", index);
            } else {
                PicaItemTipsPanel.Inst.showTips(item, data.rewards[0]);
            }
        }
    }

    private onNewOrderItemHandler(tag: string, data) {

    }
    private onClickDownHandler() {
    }

}

class OrderProgressPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private zoom: number;
    private progress: ProgressBar;
    private progressItems: OrderProgressItem[] = [];
    private receiveHandler: Handler;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene);
        this.setSize(width, height);
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = key;
        const barConfig = {
            x: 0 * dpr / 2,
            y: 15 * dpr,
            width: 271 * dpr,
            height: 11 * dpr,
            background: {
                x: 0,
                y: 0,
                width: 271 * dpr,
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
                width: 271 * dpr,
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
        this.add(this.progress);
    }

    public setProgressDatas(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        const len = content.steps.length;
        const maxvalue = 100, interval = maxvalue / len;
        let beforevalue = 0, progress = 0, lastunfinish = false;
        for (let i = 0; i < len; i++) {
            const data = content.steps[i];
            let item: OrderProgressItem;
            if (i < this.progressItems.length) {
                item = this.progressItems[i];
            } else {
                item = new OrderProgressItem(this.scene, 0, 0, this.key, this.dpr);
                this.add(item);
                this.progressItems.push(item);
                item.setHandler(this.receiveHandler);
            }
            item.x = -this.width * 0.5 + this.width * (i + 1) / len - 16 * this.dpr;
            item.y = 15 * this.dpr;
            item.setItemData(data, i, content.currentProgressValue);
            if (content.currentProgressValue >= data.targetValue) {
                progress += interval;
            } else {
                if (!lastunfinish) {
                    progress += interval * (content.currentProgressValue - beforevalue) / (data.targetValue - beforevalue);
                    lastunfinish = true;
                }
            }
            beforevalue = data.targetValue;
        }
        this.progress.setProgress(progress, maxvalue);
    }

    public setHandler(handler: Handler) {
        this.receiveHandler = handler;
    }
}
class OrderProgressItem extends Phaser.GameObjects.Container {
    public progressData: any;// op_client.IPKT_Progress
    public index: number;
    private key: string;
    private dpr: number;
    private bg: Button;
    private icon: DynamicImage;
    private text: Phaser.GameObjects.Text;
    private receiveHandler: Handler;
    private finishIcon: Phaser.GameObjects.Image;
    private balckgraphic: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.bg = new Button(scene, key, "order_progress_unfinished", "order_progress_unfinished");
        this.icon = new DynamicImage(scene, 0, 0);
        this.text = scene.make.text({ x: 0, y: this.bg.height * 0.5 + 10 * dpr, text: "10", style: { color: "#2154BD", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.text.setFontStyle("bold");
        this.text.setOrigin(0.5);
        this.finishIcon = scene.make.image({ key, frame: "order_progress_ok" });
        // this.finishIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.balckgraphic = scene.make.graphics(undefined, false);
        this.balckgraphic.clear();
        this.balckgraphic.fillStyle(0, 0.5);
        this.balckgraphic.fillCircle(0, 0, 16 * dpr);
        this.add([this.bg, this.icon, this.text, this.balckgraphic, this.finishIcon]);
        this.finishIcon.visible = false;
    }

    public setItemData(data: any, index: number, curvalue: number) {// op_client.IPKT_Progress
        this.progressData = data;
        this.index = index;
        this.text.text = data.targetValue + "";
        if (data.rewards) {
            const url = Url.getOsdRes(data.rewards[0].texturePath);
            this.icon.load(url, this, () => {
                this.icon.scale = 1;
                this.icon.scaleY = 29 * this.dpr / this.icon.displayHeight;
                this.icon.scaleX = this.icon.scaleY;
            });
        }
        this.finishIcon.visible = false;
        this.balckgraphic.visible = false;
        if (data.targetValue <= curvalue) {
            this.bg.setFrameNormal("order_progress_finished", "order_progress_finished");
            if (data.received) {
                this.finishIcon.visible = true;
                this.balckgraphic.visible = true;
            }
            this.text.setColor("#2154BD");
        } else {
            this.bg.setFrameNormal("order_progress_unfinished", "order_progress_unfinished");
            this.text.setColor("#989898");
        }
        if (!data.received) {
            this.bg.off(String(ClickEvent.Tap), this.onReceiveHandler, this);
            this.bg.on(String(ClickEvent.Tap), this.onReceiveHandler, this);
        } else {
            this.bg.off(String(ClickEvent.Tap), this.onReceiveHandler, this);
        }
    }

    public setHandler(receive: Handler) {
        this.receiveHandler = receive;
    }

    private onReceiveHandler() {
        if (this.receiveHandler) this.receiveHandler.runWith([this.index, this]);
    }
}
