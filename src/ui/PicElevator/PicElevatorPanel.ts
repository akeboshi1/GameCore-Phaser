import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { DynamicImage } from "../components/dynamic.image";
import { Handler } from "../../Handler/Handler";
import { Url } from "../../utils/resUtil";
import { AlertView } from "../components/alert.view";
import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText } from "apowophaserui";
export class PicElevatorPanel extends BasePanel {
    private key = "order_ui";
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    private mGameGrid: GameGridTable;
    private content: Phaser.GameObjects.Container;
    private goldImageValue: ImageValue;
    private royalOrderLimit: op_def.IValueBar;
    private alertView: AlertView;
    // private itemsPanel: ItemsConsumeFunPanel;
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
        // this.itemsPanel.y = this.height * 0.5 - 60 * this.dpr;
        // this.itemsPanel.x = this.width * 0.5;
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
        this.addAtlas(UIAtlasKey.common2Key, UIAtlasName.common2Url + ".png", UIAtlasName.common2Url + ".json");
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
        const tableConfig = {
            x: 0,
            y: 15 * this.dpr,
            table: {
                width: conWdith - 40 * this.dpr,
                height: conHeight - 110 * this.dpr,
                columns: 1,
                cellWidth: conWdith - 40 * this.dpr,
                cellHeight: 70 * this.dpr,
                reuseCellContainer: true,
                zoom: this.scale
            },
            scrollMode: 0,
            clamplChildOY: false,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new ElevatorItem(this.scene, this.mWorld, this.key, this.dpr);
                    cellContainer.setHandler(new Handler(this, this.onSendHandler), new Handler(this, this.onRefreshOrderList));
                    cellContainer.on("pointerdown", this.onClickDownHandler, this);
                }
                cellContainer.setOrderData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.goldImageValue = new ImageValue(this.scene, 50 * this.dpr, 14 * this.dpr, this.key, this.dpr);
        this.goldImageValue.setFrameValue("", this.key, "order_precious");
        this.goldImageValue.setTextStyle({
            color: "#144B99", fontSize: 10 * this.dpr, bold: true,
            stroke: "#144B99",
            strokeThickness: 4,
        });
        this.goldImageValue.y = conHeight * 0.5 - 25 * this.dpr;
        this.goldImageValue.visible = false;
        this.content.add([this.bg, this.closeBtn, this.titlebg, this.tilteName, this.mGameGrid, this.goldImageValue]);
        // const width: number = this.scaleWidth;
        // const height: number = this.scaleHeight;
        // this.itemsPanel = new ItemsConsumeFunPanel(this.scene, 278 * this.dpr, 198 * this.dpr, this.dpr, this.scale);
        // this.itemsPanel.createBackGrphaic(width, height);
        // this.itemsPanel.setTextInfo(i18n.t("order.progresstitle").toUpperCase(), i18n.t("order.rewardtitle"));
        // this.itemsPanel.visible = false;
        // this.add(this.itemsPanel);
        this.resize();
        super.init();
        this.emit("questlist");
        this.emit("questprogress");
    }

    public setOrderDataList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST) {
        this.goldImageValue.visible = true;
        const orders = content.orders;
        this.mGameGrid.setItems(orders);
        this.royalOrderLimit = content.royalOrderLimit;
        this.goldImageValue.setText(`${this.royalOrderLimit.currentValue}/${this.royalOrderLimit.max}`);
        this.goldImageValue.resetSize();
        this.goldImageValue.x = this.content.width * 0.5 - this.goldImageValue.width * 0.5 - 20 * this.dpr;
    }

    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.emit("hide");
    }

    private onSendHandler(index: number, orderOperator: op_pkt_def.PKT_Order_Operator) {
        if (orderOperator === op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELETE) {
            if (!this.alertView) this.alertView = new AlertView(this.scene, this.mWorld);
            this.parentContainer.add(this.alertView);
            this.alertView.show({
                text: i18n.t("order.refreshtips"),
                title: i18n.t("order.refreshtitle"),
                oy: 302 * this.dpr * this.mWorld.uiScale,
                callback: () => {
                    this.emit("changeorder", index, orderOperator);
                },
            });
        } else {
            this.emit("changeorder", index, orderOperator);
        }
    }

    private onRefreshOrderList() {
        this.emit("questlist");
    }

    private onClickDownHandler() {

    }
}

class ElevatorItem extends Phaser.GameObjects.Container {
    private FloorData: op_client.IPKT_Quest;
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
    private materialItems: MaterialItem[] = [];
    private imageValues: ImageValue[] = [];
    private orderRewards: OrderRewardItem[] = [];
    private deliverybg: Phaser.GameObjects.Image;
    private sendHandler: Handler;
    private tipsHandler: Handler;
    private refreshHandler: Handler;
    private index: number;
    private orderOperator: op_pkt_def.PKT_Order_Operator;
    private timeID: any;
    private mworld: WorldService;
    constructor(scene: Phaser.Scene, world: WorldService, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.mworld = world;
        this.bg = scene.make.image({ key, frame: "order_ordinary_bg" });
        this.add(this.bg);
        this.setSize(this.bg.width, this.bg.height);
        this.headbg = scene.make.image({ key, frame: "order_ordinary_head_bg" });
        this.add(this.headbg);
        this.headbg.x = -this.width * 0.5 + this.headbg.width * 0.5 + 4 * dpr;
        this.headbg.y = 5 * dpr;
        this.headIcon = new DynamicImage(scene, this.headbg.x, 0);
        this.add(this.headIcon);
        this.refreshBtn = new Button(scene, this.key, "order_delete_bg", "order_delete_bg");
        this.refreshBtn.x = this.width * 0.5 - this.refreshBtn.width * 0.5;
        this.refreshBtn.y = -this.height * 0.5 + this.refreshBtn.height * 0.5;
        this.add(this.refreshBtn);
        const deleteicon = scene.make.image({ key, frame: "order_delete" });
        this.refreshBtn.add(deleteicon);
        this.sendBtn = new Button(scene, UIAtlasKey.commonKey, "order_green_butt", "order_green_butt", i18n.t("order.send"));
        this.sendBtn.x = this.width * 0.5 - this.sendBtn.width * 0.5 - 5 * dpr;
        this.sendBtn.setTextStyle({ fontSize: 10 * dpr });
        this.add(this.sendBtn);
        this.sendTitle = scene.make.text({ x: this.width * 0.5 - 5 * dpr, y: 0, text: i18n.t("order.deliverying"), style: { color: "#ffffff", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.sendTitle.setOrigin(1, 0.5);
        this.add(this.sendTitle);
        this.acceleBtn = new Button(scene, UIAtlasKey.commonKey, "order_red_butt", "order_red_butt", i18n.t("order.accele"));
        this.acceleBtn.x = 20 * dpr;
        this.acceleBtn.y = 0;
        this.acceleBtn.setTextStyle({ fontSize: 11 * dpr });
        this.add(this.acceleBtn);
        this.acceleSpend = new ImageValue(scene, 30 * dpr, 10 * dpr, this.key, this.dpr);
        this.acceleSpend.x = this.acceleBtn.x;
        this.acceleSpend.y = this.acceleBtn.y - this.acceleBtn.height * 0.5 - 10 * dpr;
        this.add(this.acceleSpend);
        this.calcuTime = new ImageValue(scene, 30 * dpr, 10 * dpr, this.key, dpr);
        this.add(this.calcuTime);
        this.calcuTime.setTextStyle({
            color: "#144B99", fontSize: 10 * dpr, bold: true,
            //   stroke: "#144B99",
            //   strokeThickness: 1 * this.dpr,
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
        this.sendBtn.on(String(ClickEvent.Tap), this.onSendHandler, this);
        this.acceleBtn.on(String(ClickEvent.Tap), this.onAcceleHandler, this);
        this.refreshBtn.on(String(ClickEvent.Tap), this.onRefreshHandler, this);
        this.setInteractive();
    }

    public setHandler(send: Handler, refresh: Handler, tips: Handler) {
        this.sendHandler = send;
        this.tipsHandler = tips;
        this.refreshHandler = refresh;
    }
    public setFloorData(data: op_client.IPKT_Quest, index: number) {
        this.FloorData = data;
        this.index = index;
        this.hideAllElement();
        this.bg.setFrame(data.questType === op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION ? "order_precious_bg" : "order_ordinary_bg");
        if (data.stage !== op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END) {
            const url = Url.getOsdRes(data.display.texturePath);
            this.headIcon.load(url, this, () => {
                this.headIcon.scale = 1;
                this.headIcon.scaleY = 49 * this.dpr / this.headIcon.displayHeight;
                this.headIcon.scaleX = this.headIcon.scaleY;
            });
            this.headIcon.visible = true;
        }
        if (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_ACCEPTABLE) {
            this.deliveryState(data);
            this.orderOperator = op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELIVERY;
        } else if (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_PROCESSING) {
            this.deliveryingState(data);
        } else if (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED) {
            this.rewardState(data);
            this.orderOperator = op_pkt_def.PKT_Order_Operator.PKT_ORDER_GET_REWARD;

        } else if (data.stage === op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END) {
            this.cooldownState(data);
            this.orderOperator = op_pkt_def.PKT_Order_Operator.PKT_ORDER_SPEED_UP;
        }
    }

    destroy(fromScene?: boolean) {
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        super.destroy(fromScene);
    }

    private get serviceTimestamp() {
        return this.mworld.clock.unixTime;
    }
    private onAcceleHandler() {
        if (this.sendHandler) this.sendHandler.runWith([this.index, this.orderOperator]);
    }

    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.runWith([this.index, this.orderOperator]);
    }

    private onRefreshHandler() {
        if (this.sendHandler) this.sendHandler.runWith([this.index, op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELETE]);
    }

    private deliveryState(data: op_client.IPKT_Quest) {
        const questType = data.questType;
        this.headbg.setFrame(questType === op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION ? "order_precious_head_bg" : "order_ordinary_head_bg");
        this.refreshBtn.visible = true;
        this.refreshBtn.setInteractive();
        this.refreshBtn.setFrameNormal(questType === op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION ? "order_precious_delete_bg" : "order_delete_bg");
        let offsetpos = -this.width * 0.5 + 58 * this.dpr;
        let isenough = true;
        for (let i = 0; i < data.targets.length; i++) {
            const itemData = data.targets[i];
            let item: MaterialItem;
            if (i < this.materialItems.length) {
                item = this.materialItems[i];
            } else {
                item = new MaterialItem(this.scene, this.key, this.dpr);
                this.add(item);
                this.materialItems.push(item);
                item.setHandler(this.tipsHandler);
                item.addListen();
            }
            item.setMaterialData(itemData);
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 8 * this.dpr;
            item.y = -10 * this.dpr;
            item.visible = true;
            isenough = itemData.count >= itemData.neededCount;
        }
        if (isenough) {
            this.sendBtn.setFrameNormal("order_green_butt");
            this.sendBtn.setInteractive();
        } else {
            this.sendBtn.setFrameNormal("order_gray_butt");
            this.sendBtn.disInteractive();
        }
        this.sendBtn.visible = true;
        this.sendBtn.setText(i18n.t("order.send"));
        this.sendBtn.setTextColor("#ffffff");
        offsetpos = -this.width * 0.5 + 58 * this.dpr;
        for (let i = 0; i < data.rewards.length; i++) {
            const reward = data.rewards[i];
            let item: ImageValue;
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new ImageValue(this.scene, 30 * this.dpr, 13 * this.dpr, this.key, this.dpr, this.dpr);
                this.add(item);
                this.imageValues.push(item);
            }
            item.setFrameValue(`x${reward.count}`, this.key, this.getIconName(reward.display.texturePath) + "_s");
            item.setTextStyle({ color: questType === op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION ? "#ffffff" : "#2154BD" });
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 20 * this.dpr;
            item.y = this.height * 0.5 - item.height * 0.5 - 4 * this.dpr;
            item.visible = true;
        }
    }

    private deliveryingState(data: op_client.IPKT_Quest) {
        if (!this.deliverybg) {
            this.deliverybg = this.scene.make.image({ key: this.key, frame: "order_transport" });
            this.addAt(this.deliverybg, 1);
            this.deliverybg.x = this.width * 0.5 - this.deliverybg.width * 0.5 - 10 * this.dpr;
        } else this.deliverybg.visible = true;
        this.headbg.setFrame("order_ordinary_head_bg");
        // this.refreshBtn.visible = true;
        // this.refreshBtn.setInteractive();
        // this.refreshBtn.setFrameNormal("order_delete_bg");
        this.sendTitle.visible = true;
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        const timeextu = () => {
            let intervalTime = Math.ceil(data.deliveryDeadline - this.serviceTimestamp / 1000);
            if (intervalTime < 0) intervalTime = 0;
            const minute = Math.floor(intervalTime / 60);
            const second = intervalTime % 60;
            const timetext = `${minute < 10 ? "0" + minute : minute + ""}:${second < 10 ? "0" + second : second + ""}`;
            this.calcuTime.visible = true;
            this.calcuTime.setFrameValue(timetext, this.key, "order_time");
            this.calcuTime.resetSize();
            this.calcuTime.x = this.width * 0.5 - this.calcuTime.width * 0.5 - 10 * this.dpr;
            this.calcuTime.y = this.height * 0.5 - this.calcuTime.height * 0.5 - 5 * this.dpr;
            if (intervalTime > 0) this.timeID = setTimeout(() => {
                timeextu();
            }, 1000);// intervalTime >= 60 ? 60000 : intervalTime * 1000
            else {
                if (this.timeID && this.refreshHandler) this.refreshHandler.run();
                this.timeID = undefined;
            }
        };
        timeextu();
        let offsetpos = -this.width * 0.5 + 60 * this.dpr;
        for (let i = 0; i < data.rewards.length; i++) {
            const reward = data.rewards[i];
            let item: ImageValue;
            if (i < this.imageValues.length) {
                item = this.imageValues[i];
            } else {
                item = new ImageValue(this.scene, 30 * this.dpr, 13 * this.dpr, this.key, this.dpr, this.dpr);
                this.add(item);
                this.imageValues.push(item);
            }
            item.setFrameValue(`x${reward.count}`, this.key, this.getIconName(reward.display.texturePath) + "_s");
            item.setTextStyle({ color: "#2154BD" });
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 20 * this.dpr;
            item.y = this.height * 0.5 - item.height * 0.5 - 4 * this.dpr;
            item.visible = true;
        }
    }

    private rewardState(data: op_client.IPKT_Quest) {
        this.headbg.setFrame("order_ordinary_head_bg");
        // this.refreshBtn.visible = true;
        // this.refreshBtn.setInteractive();
        // this.refreshBtn.setFrameNormal("order_delete_bg");
        this.sendBtn.visible = true;
        this.sendBtn.setInteractive();
        this.sendBtn.setFrameNormal("order_yellow_butt");
        this.sendBtn.setText(i18n.t("order.receive"));
        this.sendBtn.setTextColor("#9A6600");
        let offsetpos = -this.width * 0.5 + 60 * this.dpr;
        for (let i = 0; i < data.rewards.length; i++) {
            const reward = data.rewards[i];
            let item: OrderRewardItem;
            if (i < this.orderRewards.length) {
                item = this.orderRewards[i];
            } else {
                item = new OrderRewardItem(this.scene, this.key, this.dpr);
                this.add(item);
                this.orderRewards.push(item);
            }
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 20 * this.dpr;
            item.y = -6 * this.dpr;
            item.visible = true;
            item.setItemData(reward);
        }

    }

    private cooldownState(data: op_client.IPKT_Quest) {
        this.headbg.setFrame("order_unknown_head");
        this.headIcon.visible = false;
        // this.refreshBtn.visible = false;
        // this.refreshBtn.disInteractive();
        this.acceleBtn.visible = true;
        this.acceleBtn.setInteractive();
        this.acceleSpend.visible = true;
        this.calcuTime.visible = true;
        this.calcuTime.y = this.acceleBtn.y + this.acceleBtn.height * 0.5 + 10 * this.dpr;
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        const timeextu = () => {
            let intervalTime = Math.ceil(data.refreshDeadline - this.serviceTimestamp / 1000);
            if (intervalTime < 0) intervalTime = 0;
            const minute = Math.floor(intervalTime / 60);
            const second = intervalTime % 60;
            const timetext = `${minute < 10 ? "0" + minute : minute + ""}:${second < 10 ? "0" + second : second + ""}`;
            this.calcuTime.visible = true;
            this.calcuTime.setFrameValue(timetext, this.key, "order_time");
            this.calcuTime.resetSize();
            this.calcuTime.x = this.acceleBtn.x;
            this.acceleSpend.setFrameValue(minute + "", this.key, "iv_diamond_s");
            if (intervalTime > 0) this.timeID = setTimeout(() => {
                timeextu();
            }, 1000);// intervalTime >= 60 ? 60000 : intervalTime * 1000
            else {
                if (this.timeID && this.refreshHandler) this.refreshHandler.run();
                this.timeID = undefined;
            }
        };
        timeextu();
    }

    private getIconName(url: string) {
        const texturepath = url;
        const lastindex = texturepath.lastIndexOf("/");
        const lastindex2 = texturepath.lastIndexOf(".");
        const frame = texturepath.slice(lastindex + 1, lastindex2);
        return frame;
    }
    private hideAllElement() {
        this.refreshBtn.visible = false;
        this.refreshBtn.disInteractive();
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
            item.removeListen();
        }
        for (const item of this.orderRewards) {
            item.visible = false;
        }
        for (const item of this.imageValues) {
            item.visible = false;
        }
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
    }
}

class MaterialItem extends Phaser.GameObjects.Container {
    public itemData: op_client.ICountablePackageItem;
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private icon: DynamicImage;
    private value: BBCodeText;
    private tipsHandler: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = scene.make.image({ key, frame: "order_demand_icon" });
        this.setSize(this.bg.width, this.bg.height);
        this.icon = new DynamicImage(scene, 0, -5 * dpr);
        this.icon.setSize(15 * dpr, 15 * dpr);
        this.value = new BBCodeText(this.scene, 0, 6 * dpr, "60/30", {
            color: "#0",
            fontSize: 8 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0.5);
        this.add([this.bg, this.icon, this.value]);
        this.setInteractive();
    }
    public setMaterialData(data: op_client.ICountablePackageItem) {
        this.itemData = data;
        const url = Url.getOsdRes(data.display.texturePath);
        this.icon.load(url, this, () => {
            this.icon.scale = 1;
            this.icon.scaleX = this.icon.displayWidth / this.icon.width;
            this.icon.scaleY = this.icon.scaleX;
        });
        this.value.text = `${data.count}/${data.neededCount}`;
    }

    public setHandler(tips: Handler) {
        this.tipsHandler = tips;
    }

    public addListen() {
        this.on("pointerup", this.onClickHandler, this);
    }

    public removeListen() {
        this.off("pointerdown", this.onClickHandler, this);
    }

    destroy(fromScene?: boolean) {
        this.removeListen();
        super.destroy(fromScene);
    }
    private onClickHandler() {
        if (this.tipsHandler) this.tipsHandler.runWith(this);
    }
}

class ImageValue extends Phaser.GameObjects.Container {
    private dpr: number;
    private icon: Phaser.GameObjects.Image;
    private value: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, offsetx: number = 0) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.icon = scene.make.image({ key, frame: "iv_coin_s" });
        this.value = scene.make.text({ x: 0, y: offsetx, text: "10", style: { color: "#ffffff", fontSize: 11 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.value.setOrigin(0, 0.5);
        this.add([this.icon, this.value]);
    }
    public setFrameValue(text: string, key: string, frame: string) {
        this.icon.setTexture(key, frame);
        this.value.text = text;
        this.resetPosition();
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
        this.value.x = this.icon.x + this.icon.displayWidth * 0.5 + 4 * this.dpr;
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
        this.icon = scene.make.image({ key, frame: "order_silver_middle" });
        this.text = scene.make.text({ x: 0, y: this.bg.height * 0.5 + 13 * dpr, text: "10", style: { color: "#144B99", fontSize: 9 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.text.setOrigin(0.5);
        this.add([this.bg, this.icon, this.text]);
    }

    public setItemData(data: op_client.ICountablePackageItem) {
        this.text.text = `${data.name}*${data.count}`;
        const texturepath = data.display.texturePath;
        const lastindex = texturepath.lastIndexOf("/");
        const lastindex2 = texturepath.lastIndexOf(".");
        const frame = data.display.texturePath.slice(lastindex + 1, lastindex2);
        this.icon.setFrame(frame);
    }
}
