import { NineSlicePatch, GameGridTable, Button, ClickEvent, BBCodeText, ProgressBar } from "apowophaserui";
import { AlertView, BasePanel, DynamicImage, ImageValue, ItemInfoTips, Render, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { Font, Handler, i18n, Logger, Url } from "utils";
import { ICountablePackageItem } from "picaStructure";
export class PicaOrderPanel extends BasePanel {
    private mBackground: Phaser.GameObjects.Graphics;
    private bg: NineSlicePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    private mGameGrid: GameGridTable;
    private content: Phaser.GameObjects.Container;
    private orderProgressPanel: OrderProgressPanel;
    private goldImageValue: ImageValue;
    private royalOrderLimit: any;// op_def.IValueBar
    private itemtips: ItemInfoTips;
    // private itemsPanel: ItemsConsumeFunPanel;
    private progressData: any;// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
        this.key = ModuleName.PICAORDER_NAME;
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
        this.content.y = h * 0.5 + 10 * this.dpr;
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
        Logger.getInstance().debug("=====>> dpr", this.dpr);
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
        this.titlebg = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "order_title_bg" });
        this.titlebg.y = posY - this.titlebg.height * 0.5 + 2 * this.dpr;
        const titlebg2 = this.scene.make.image({ x: 0, y: 0, key: this.key, frame: "order_title" });
        titlebg2.y = this.titlebg.y + 34 * this.dpr;
        this.tilteName = this.scene.make.text({ x: 0, y: posY - 18 * this.dpr, text: i18n.t("order.title"), style: { color: "#905B06", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.closeBtn = this.scene.make.image({ x: conWdith * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: UIAtlasKey.commonKey, frame: "close" });
        this.tilteName.setStroke("#8F4300", 2);
        this.tilteName.setResolution(this.dpr);
        this.closeBtn.setInteractive();
        this.orderProgressPanel = new OrderProgressPanel(this.scene, 252 * this.dpr, 45 * this.dpr, this.key, this.dpr);
        this.orderProgressPanel.y = -conHeight * 0.5 + 20 * this.dpr;
        this.orderProgressPanel.setHandler(new Handler(this, this.onProgressHandler));
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
            createCellContainerCallback: (cell, cellContainer) => {
                const scene = cell.scene, index = cell.index,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = new OrderItem(this.uiManager, this.key, this.dpr);
                    cellContainer.setHandler(new Handler(this, this.onSendHandler), new Handler(this, this.onRefreshOrderList), new Handler(this, this.onItemInfoTips));
                    cellContainer.on("pointerdown", this.onClickDownHandler, this);
                }
                cellContainer.setOrderData(item, index);
                return cellContainer;
            },
        };
        this.mGameGrid = new GameGridTable(this.scene, tableConfig);
        this.mGameGrid.layout();
        this.goldImageValue = new ImageValue(this.scene, 50 * this.dpr, 14 * this.dpr, this.key, "iv_coin_s", this.dpr);
        this.goldImageValue.setFrameValue("", this.key, "order_precious");
        this.goldImageValue.setTextStyle({
            color: "#144B99", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT,
        });
        this.goldImageValue.setFontStyle("bold");
        this.goldImageValue.y = conHeight * 0.5 - 25 * this.dpr;
        this.goldImageValue.visible = false;
        this.orderProgressPanel.visible = false;
        this.itemtips = new ItemInfoTips(this.scene, 121 * this.dpr, 46 * this.dpr, UIAtlasKey.common2Key, "tips_bg", this.dpr);
        this.itemtips.setVisible(false);
        this.content.add([this.bg, this.closeBtn, this.titlebg, titlebg2, this.tilteName, this.orderProgressPanel, this.mGameGrid, this.goldImageValue, this.itemtips]);
        this.resize();
        super.init();
        this.render.renderEmitter(ModuleName.PICAORDER_NAME + "_questlist");
        this.render.renderEmitter(ModuleName.PICAORDER_NAME + "_questprogress");
    }

    public setOrderDataList(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ORDER_LIST
        this.goldImageValue.visible = true;
        this.orderProgressPanel.visible = true;
        const orders = content.orders;
        this.mGameGrid.setItems(orders);
        this.royalOrderLimit = content.royalOrderLimit;
        this.goldImageValue.setText(`${this.royalOrderLimit.currentValue}/${this.royalOrderLimit.max}`);
        this.goldImageValue.resetSize();
        this.goldImageValue.x = this.content.width * 0.5 - this.goldImageValue.width * 0.5 - 20 * this.dpr;
    }

    public setOrderProgress(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        this.progressData = content;
        this.orderProgressPanel.setProgressDatas(content);
    }
    destroy() {
        super.destroy();
    }

    private OnClosePanel() {
        this.render.renderEmitter(ModuleName.PICAORDER_NAME + "_hide");
    }

    private onSendHandler(index: number, orderOperator: any) {// op_pkt_def.PKT_Order_Operator
        if (orderOperator === 2) {// op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELETE
            const alertView = new AlertView(this.scene, this.uiManager);
            alertView.show({
                text: i18n.t("order.refreshtips"),
                title: i18n.t("order.refreshtitle"),
                oy: 302 * this.dpr * this.mWorld.uiScale,
                callback: () => {
                    this.render.renderEmitter(ModuleName.PICAORDER_NAME + "_changeorder", { index, orderOperator });
                },
            });
        } else {
            this.render.renderEmitter(ModuleName.PICAORDER_NAME + "_changeorder", { index, orderOperator });
        }
    }

    private onProgressHandler(index: number, item: OrderProgressItem) {
        if (!this.progressData) return;
        const data = item.progressData;
        if (!data.received) {
            if (data.targetValue <= this.progressData.currentProgressValue) {
                this.render.renderEmitter(ModuleName.PICAORDER_NAME + "_questreward", index);
            } else {
                this.itemtips.setItemData(data.rewards[0]);
                this.showItemTipsState(item);
            }
        }
    }

    private onRefreshOrderList() {
        this.render.renderEmitter(ModuleName.PICAORDER_NAME + "_questlist");
    }
    private onItemInfoTips(item: MaterialItem) {
        const data = item.itemData;
        this.itemtips.setItemData(data);
        this.showItemTipsState(item, 10 * this.dpr);
    }

    private onClickDownHandler() {
        this.itemtips.setVisible(false);
    }

    private showItemTipsState(item: Phaser.GameObjects.Container, offsety: number = 0) {
        const posx = this.itemtips.x;
        const posy = this.itemtips.y;
        this.setTipsPosition(item, offsety);
        if (posx !== this.itemtips.x || posy !== this.itemtips.y) {
            this.itemtips.setVisible(true);
        } else {
            this.itemtips.setVisible(!this.itemtips.visible);
        }
    }

    private setTipsPosition(gameobject: Phaser.GameObjects.Container, offsety: number = 0) {
        let posx: number = gameobject.x;
        let posy: number = gameobject.y;
        let tempobject = <Phaser.GameObjects.Container>gameobject;
        while (tempobject.parentContainer !== this.content) {
            posx += tempobject.parentContainer.x;
            posy += tempobject.parentContainer.y;
            tempobject = tempobject.parentContainer;
        }
        if (posx - this.itemtips.width * 0.5 < -this.content.width * 0.5) {
            this.itemtips.x = this.itemtips.width * 0.5 - this.content.width * 0.5 + 20 * this.dpr;
        } else if (posx + this.itemtips.width * 0.5 > this.content.width * 0.5) {
            this.itemtips.x = this.content.width * 0.5 - this.itemtips.width * 0.5 - 20 * this.dpr;
        } else {
            this.itemtips.x = posx;
        }
        this.itemtips.y = posy - this.itemtips.height * 0.5 + 10 * this.dpr + offsety;
    }
}

class OrderItem extends Phaser.GameObjects.Container {
    private orderData: any;// op_client.IPKT_Quest
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
    private orderOperator: any;// op_pkt_def.PKT_Order_Operator
    private timeID: any;
    private mRender: Render;
    private mScene: Phaser.Scene;
    constructor(uiManager: UiManager, key: string, dpr: number) {
        super(uiManager.scene);
        this.key = key;
        this.dpr = dpr;
        this.mScene = uiManager.scene;
        this.mRender = uiManager.render;
        this.bg = this.mScene.make.image({ key, frame: "order_ordinary_bg" });
        // this.bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(this.bg);
        this.setSize(this.bg.width, this.bg.height);
        this.headbg = this.mScene.make.image({ key, frame: "order_ordinary_head_bg" });
        // this.headbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(this.headbg);
        this.headbg.x = -this.width * 0.5 + this.headbg.width * 0.5 + 4 * dpr;
        this.headbg.y = 5 * dpr;
        this.headIcon = new DynamicImage(this.mScene, this.headbg.x, 0);
        // this.headIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(this.headIcon);
        this.refreshBtn = new Button(this.mScene, this.key, "order_delete_bg", "order_delete_bg");
        this.refreshBtn.x = this.width * 0.5 - this.refreshBtn.width * 0.5;
        this.refreshBtn.y = -this.height * 0.5 + this.refreshBtn.height * 0.5;
        this.add(this.refreshBtn);
        const deleteicon = this.mScene.make.image({ key, frame: "order_delete" });
        // deleteicon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.refreshBtn.add(deleteicon);
        this.sendBtn = new Button(this.mScene, UIAtlasKey.commonKey, "order_green_butt", "order_green_butt", i18n.t("order.send"));
        this.sendBtn.x = this.width * 0.5 - this.sendBtn.width * 0.5 - 5 * dpr;
        this.sendBtn.setTextStyle({ fontSize: 10 * dpr });
        this.add(this.sendBtn);
        this.sendTitle = this.mScene.make.text({ x: this.width * 0.5 - 5 * dpr, y: 0, text: i18n.t("order.deliverying"), style: { color: "#ffffff", fontSize: 13 * dpr, fontFamily: Font.DEFULT_FONT } });
        this.sendTitle.setOrigin(1, 0.5);
        this.add(this.sendTitle);
        this.acceleBtn = new Button(this.mScene, UIAtlasKey.commonKey, "order_red_butt", "order_red_butt", i18n.t("order.accele"));
        this.acceleBtn.x = 20 * dpr;
        this.acceleBtn.y = 0;
        this.acceleBtn.setTextStyle({ fontSize: 11 * dpr });
        this.add(this.acceleBtn);
        this.acceleSpend = new ImageValue(this.mScene, 30 * dpr, 10 * dpr, this.key, "iv_coin_s", this.dpr);
        this.acceleSpend.x = this.acceleBtn.x;
        this.acceleSpend.y = this.acceleBtn.y - this.acceleBtn.height * 0.5 - 10 * dpr;
        this.add(this.acceleSpend);
        this.calcuTime = new ImageValue(this.mScene, 30 * dpr, 10 * dpr, this.key, "iv_coin_s", dpr);
        this.add(this.calcuTime);
        this.calcuTime.setTextStyle({
            color: "#144B99", fontSize: 10 * this.dpr, fontFamily: Font.DEFULT_FONT,
        });
        this.calcuTime.setFontStyle("bold");
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
    public setOrderData(data: any, index: number) {// op_client.IPKT_Quest
        this.orderData = data;
        this.index = index;
        this.hideAllElement();
        this.bg.setFrame(data.questType === 5 ? "order_precious_bg" : "order_ordinary_bg");// op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION
        if (data.stage !== 4) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END
            const texturePath = data.display.texturePath + `_${this.dpr}x.png`;
            const url = Url.getOsdRes(texturePath);
            this.headIcon.load(url, this, () => {
                // this.headIcon.scale = 1;
                // this.headIcon.scaleY = 49 * this.dpr / this.headIcon.displayHeight;
                // this.headIcon.scaleX = this.headIcon.scaleY;
            });
            this.headIcon.visible = true;
        }
        if (data.stage === 1) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_ACCEPTABLE
            this.deliveryState(data);
            this.orderOperator = 0;// op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELIVERY
        } else if (data.stage === 2) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_PROCESSING
            this.deliveryingState(data);
        } else if (data.stage === 3) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_FINISHED
            this.rewardState(data);
            this.orderOperator = 3;// op_pkt_def.PKT_Order_Operator.PKT_ORDER_GET_REWARD

        } else if (data.stage === 4) {// op_pkt_def.PKT_Quest_Stage.PKT_QUEST_STAGE_END
            this.cooldownState(data);
            this.orderOperator = 1;// op_pkt_def.PKT_Order_Operator.PKT_ORDER_SPEED_UP
        }
    }

    destroy(fromScene?: boolean) {
        if (this.timeID) {
            clearTimeout(this.timeID);
            this.timeID = undefined;
        }
        super.destroy(fromScene);
    }

    private getServiceTimestamp(): Promise<number> {
        return this.mRender.mainPeer.now();
    }
    private onAcceleHandler() {
        if (this.sendHandler) this.sendHandler.runWith([this.index, this.orderOperator]);
    }

    private onSendHandler() {
        if (this.sendHandler) this.sendHandler.runWith([this.index, this.orderOperator]);
    }

    private onRefreshHandler() {
        if (this.sendHandler) this.sendHandler.runWith([this.index, 2]);// op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELETE
    }

    private deliveryState(data: any) {// op_client.IPKT_Quest
        const questType = data.questType;
        this.headbg.setFrame(questType === 5 ? "order_precious_head_bg" : "order_ordinary_head_bg");// op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION
        this.refreshBtn.visible = true;
        this.refreshBtn.setInteractive();
        this.refreshBtn.setFrameNormal(questType === 5 ? "order_precious_delete_bg" : "order_delete_bg");// op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION
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
            if (isenough)
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
                item = new ImageValue(this.scene, 30 * this.dpr, 13 * this.dpr, this.key, "iv_coin_s", this.dpr);
                this.add(item);
                this.imageValues.push(item);
            }
            item.setOffset(0, this.dpr);
            item.setFrameValue(`${reward.count}`, this.key, this.getIconName(reward.texturePath) + "_s");
            item.setTextStyle({ color: questType === 5 ? "#ffffff" : "#2154BD" });// op_pkt_def.PKT_Quest_Type.ORDER_QUEST_ROYAL_MISSION
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 20 * this.dpr;
            item.y = this.height * 0.5 - item.height * 0.5 - 4 * this.dpr;
            item.visible = true;
        }
    }

    private deliveryingState(data: any) {// op_client.IPKT_Quest
        if (!this.deliverybg) {
            this.deliverybg = this.scene.make.image({ key: this.key, frame: "order_transport" });
            // this.deliverybg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
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
        const timeextu = async () => {
            const timeStamp = await this.getServiceTimestamp();
            let intervalTime = Math.ceil(data.deliveryDeadline - timeStamp / 1000);
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
                item = new ImageValue(this.scene, 30 * this.dpr, 13 * this.dpr, this.key, "iv_coin_s", this.dpr);
                this.add(item);
                this.imageValues.push(item);
            }
            item.setFrameValue(`${reward.count}`, this.key, this.getIconName(reward.display.texturePath) + "_s");
            item.setTextStyle({ color: "#2154BD" });
            item.x = offsetpos + item.width * 0.5;
            offsetpos += item.width + 20 * this.dpr;
            item.y = this.height * 0.5 - item.height * 0.5 - 4 * this.dpr;
            item.visible = true;
        }
    }

    private rewardState(data: any) {// op_client.IPKT_Quest
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

    private cooldownState(data: any) {// op_client.IPKT_Quest
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
        const timeextu = async () => {
            const timeStamp = await this.getServiceTimestamp();
            let intervalTime = Math.ceil(data.refreshDeadline - timeStamp / 1000);
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
    public itemData: any;// op_client.ICountablePackageItem
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
        this.value = new BBCodeText(this.scene, 0, this.height * 0.5 - 10 * dpr, "60/30", {
            color: "#0",
            fontSize: 8 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0.5);
        this.add([this.bg, this.icon, this.value]);
        this.setInteractive();
    }
    public setMaterialData(data: ICountablePackageItem) {// op_client.ICountablePackageItem
        this.itemData = data;
        const url = Url.getOsdRes(data.texturePath);
        this.icon.load(url, this, () => {
            this.icon.scale = 1;
            this.icon.scaleX = 15 * this.dpr / this.icon.displayWidth;
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

class OrderRewardItem extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private bg: Phaser.GameObjects.Image;
    private icon: Phaser.GameObjects.Image;
    private imageValue: ImageValue;

    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = scene.make.image({ key, frame: "order_reward" });
        this.setSize(this.bg.width, this.bg.height);
        this.icon = scene.make.image({ key, frame: "order_silver_middle" });
        this.add([this.bg, this.icon]);
    }

    public setItemData(data: ICountablePackageItem) {// op_client.ICountablePackageItem
        this.imageValue = new ImageValue(this.scene, 30 * this.dpr, 13 * this.dpr, this.key, undefined, this.dpr);
        this.imageValue.setFrameValue(`${data.count}`, this.key, this.getIconName(data.texturePath) + "_s");
        this.imageValue.x = -4 * this.dpr;
        this.imageValue.y = this.height - this.imageValue.height * 0.5 + 2 * this.dpr;
        this.imageValue.setOffset(0, this.dpr);
        this.imageValue.setTextStyle({ color: "#2154BD" });
        this.add([this.imageValue]);
        this.icon.setFrame(this.getIconName(data.texturePath));
    }

    private getIconName(url: string) {
        const texturepath = url;
        const lastindex = texturepath.lastIndexOf("/");
        const lastindex2 = texturepath.lastIndexOf(".");
        const frame = texturepath.slice(lastindex + 1, lastindex2);
        return frame;
    }
}

class OrderProgressPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private progress: ProgressBar;
    private progressItems: OrderProgressItem[] = [];
    private receiveHandler: Handler;
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
