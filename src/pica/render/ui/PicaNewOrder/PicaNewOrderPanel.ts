import { op_client, op_pkt_def } from "pixelpai_proto";
import { AlertView, ThreeSliceButton, ToggleColorButton, UiManager } from "gamecoreRender";
import { ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { ClickEvent } from "apowophaserui";
import { PicaNewOrderContentPanel } from "./PicaNewOrderContentPanel";
import { ImageValue } from "..";
export class PicaNewOrderPanel extends PicaBasePanel {
    public static PICAMAIL_CLOSE: string = "PICAMAIL_CLOSE";
    public static PICAMAIL_DATA: string = "PICAMAIL_DATA";
    public mainPanel: PicaNewOrderContentPanel;
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Graphics;
    private tilteName: Phaser.GameObjects.Text;
    private goldImageValue: ImageValue;
    private content: Phaser.GameObjects.Container;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICANEWORDER_NAME;
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.order_new];
    }
    public hide() {
        this.render.emitter.emit(PicaNewOrderPanel.PICAMAIL_CLOSE);
        super.hide();
    }
    resize(width?: number, height?: number) {
        const w: number = this.scaleWidth;
        const h: number = this.scaleHeight;
        super.resize(w, h);
        this.setSize(w, h);
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.5);
        this.blackBg.fillRect(-this.x, -this.y, w, h);
        this.bg.clear();
        this.bg.fillStyle(0, 0.6);
        this.bg.fillRect(0, 0, this.content.width, h);
        this.bg.x = -this.content.width * 0.5;
        this.bg.y = -this.content.height * 0.5;
        this.content.x = this.width + this.content.width * 0.5 + 10 * this.dpr;
        this.content.y = h * 0.5;
        this.blackBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.mainPanel.refreshMask();
    }

    onShow() {
        if (this.tempDatas) this.setOrderDatas(this.tempDatas);
        this.render.renderEmitter(ModuleName.PICANEWORDER_NAME + "_questlist");
        this.render.renderEmitter(ModuleName.PICANEWORDER_NAME + "_questprogress");
    }
    public addListen() {
        if (!this.mInitialized) return;
        this.blackBg.on("pointerup", this.onClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.blackBg.off("pointerup", this.onClosePanel, this);
    }
    init() {
        this.setSize(this.scaleWidth, this.scaleHeight);
        this.blackBg = this.scene.make.graphics(undefined, false);
        const conWidth = 300 * this.dpr;
        const conHeight = this.height;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWidth, conHeight);
        this.content.setInteractive();
        this.add([this.blackBg, this.content]);
        this.bg = this.scene.make.graphics(undefined, false);
        this.tilteName = this.scene.make.text({ text: i18n.t("order.title"), style: UIHelper.whiteStyle(this.dpr, 18) });
        this.tilteName.setOrigin(0, 0.5);
        this.tilteName.setFontStyle("bold");
        this.tilteName.x = -conWidth * 0.5 + 20 * this.dpr;
        this.tilteName.y = -conHeight * 0.5 + 40 * this.dpr;
        this.goldImageValue = new ImageValue(this.scene, 50 * this.dpr, 14 * this.dpr, UIAtlasName.order_new, "order_precious_icon", this.dpr);
        this.goldImageValue.setFrameValue("", UIAtlasName.order_new, "order_precious_icon");
        this.goldImageValue.setTextStyle(UIHelper.colorStyle("#ffffff", 12 * this.dpr));
        this.goldImageValue.setOffset(2 * this.dpr, 0);
        this.goldImageValue.setLayout(3);
        this.goldImageValue.y = this.tilteName.y;
        this.goldImageValue.visible = false;
        const mainHeight = this.height * 0.5 - this.tilteName.y - this.tilteName.height * 0.5 - 20 * this.dpr;
        this.mainPanel = new PicaNewOrderContentPanel(this.scene, this.content.width, mainHeight, this.dpr, this.scale);
        this.mainPanel.setHandler(new Handler(this, this.onOrderContentHandler));
        this.mainPanel.y = this.height * 0.5 - mainHeight * 0.5 - 20 * this.dpr;
        this.content.add([this.bg, this.goldImageValue, this.tilteName, this.mainPanel]);
        this.resize();
        super.init();
        this.playMove();
    }

    setOrderDatas(content: any) {
        this.tempDatas = content;
        if (!this.mInitialized) return;
        this.goldImageValue.visible = true;
        const orders = content.orders;
        const limit = content.royalOrderLimit;
        this.goldImageValue.setText(`${limit.currentValue}/${limit.max}`);
        this.goldImageValue.resetSize();
        this.goldImageValue.x = this.content.width * 0.5 - this.goldImageValue.width * 0.5 - 20 * this.dpr;
        this.mainPanel.setOrderDataList(orders);
    }
    public setOrderProgress(content: any) {// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS
        this.mainPanel.setOrderProgress(content);
    }
    private onOrderContentHandler(tag: string, data: any) {// op_pkt_def.PKT_Order_Operator
        if (tag === "orderoperator") {
            this.queryOrderOperator(data.id, data.operator, data.count);
        } else if (tag === "refreshorder") {
            this.render.renderEmitter(ModuleName.PICANEWORDER_NAME + "_questlist");
        } else if (tag === "progressreward") {
            this.render.renderEmitter(ModuleName.PICANEWORDER_NAME + "_questreward", data);
        }
    }

    private queryOrderOperator(index: number, orderOperator: any, data?: any) {
        let text: any, title: any;
        if (orderOperator === 2) {// op_pkt_def.PKT_Order_Operator.PKT_ORDER_DELETE
            text = i18n.t("order.refreshtips");
            title = i18n.t("order.refreshtitle");
        } else if (orderOperator === 1) {
            text = i18n.t("order.accelecontent", { name: data });
            title = i18n.t("order.acceletitle");
        }
        if (text) {
            const alertView = new AlertView(this.scene, this.uiManager);
            alertView.show({
                text,
                title,
                oy: 302 * this.dpr * this.mWorld.uiScale,
                callback: () => {
                    this.render.renderEmitter(ModuleName.PICANEWORDER_NAME + "_changeorder", { index, orderOperator });
                },
            });
        } else {
            this.render.renderEmitter(ModuleName.PICANEWORDER_NAME + "_changeorder", { index, orderOperator });
        }
    }
    private onClosePanel() {
        this.render.renderEmitter(ModuleName.PICANEWORDER_NAME + "_hide");
    }

    private playMove() {
        const from = this.width + this.content.width * 0.5 + 10 * this.dpr;
        const to = this.width - this.content.width * 0.5;
        const tween = this.scene.tweens.add({
            targets: this.content,
            x: {
                from,
                to
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.mainPanel.refreshMask();
            },
        });
    }
}
