import { op_client, op_pkt_def } from "pixelpai_proto";
import { TextButton, ToggleColorButton, UiManager } from "gamecoreRender";
import { ConnectState, ModuleName } from "structure";
import { UIAtlasName } from "picaRes";
import { Handler, i18n, UIHelper } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaTaskMainPanel } from "./PicaTaskMainPanel";
import { ClickEvent } from "apowophaserui";
export class PicaTaskPanel extends PicaBasePanel {
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Graphics;
    private tilteName: Phaser.GameObjects.Text;
    private content: Phaser.GameObjects.Container;
    private mainPanel: PicaTaskMainPanel;
    private selectLine: Phaser.GameObjects.Graphics;
    private curToggleItem: ToggleColorButton;
    private questType: op_pkt_def.PKT_Quest_Type;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.key = ModuleName.PICATASK_NAME;
        this.atlasNames = [UIAtlasName.uicommon];
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
        this.bg.fillStyle(0, 0.5);
        this.bg.fillRect(0, 0, this.content.width, h);
        this.bg.x = -this.content.width * 0.5;
        this.bg.y = -this.content.height * 0.5;
        this.selectLine.clear();
        this.selectLine.fillStyle(0, 0.5);
        this.selectLine.fillRect(-29 * this.dpr, 0, 58 * this.dpr, 2 * this.dpr);
        this.content.x = this.content.width * 0.5;
        this.content.y = h * 0.5;
        this.blackBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.blackBg.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.blackBg.off("pointerup", this.OnClosePanel, this);
    }
    init() {
        this.setSize(this.scaleWidth, this.scaleHeight);
        this.blackBg = this.scene.make.graphics(undefined, false);
        const conWdith = 300 * this.dpr;
        const conHeight = this.height;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(conWdith, conHeight);
        this.content.setInteractive();
        this.add([this.blackBg, this.content]);
        this.bg = this.scene.make.graphics(undefined, false);
        this.tilteName = this.scene.make.text({ text: i18n.t("task.title"), style: UIHelper.whiteStyle(this.dpr, 18) });
        this.tilteName.setOrigin(0, 0.5);
        this.tilteName.setFontStyle("bold");
        this.tilteName.x = -conWdith * 0.5 + 20 * this.dpr;
        this.tilteName.y = -conHeight * 0.5 + 50 * this.dpr;
        this.selectLine = this.scene.make.graphics(undefined, false);
        this.content.add([this.bg, this.tilteName, this.selectLine]);
        this.mainPanel = new PicaTaskMainPanel(this.scene, this.content.width, this.height - 76 * this.dpr, this.dpr, this.scale);
        this.mainPanel.setHandler(new Handler(this, this.onMainPanelHandler));
        this.content.add(this.mainPanel);
        this.resize();
        super.init();
        this.createOptionButtons();
    }

    createOptionButtons() {
        const arr = [{ text: i18n.t("task.main_quest"), type: op_pkt_def.PKT_Quest_Type.QUEST_MAIN_MISSION }, { text: i18n.t("task.daily_quest"), type: op_pkt_def.PKT_Quest_Type.QUEST_DAILY_GOAL }];
        const allLin = 272 * this.dpr;
        const cellwidth = allLin / arr.length;
        const cellHeight = 20 * this.dpr;
        let posx = -allLin / 2;
        const posy = -this.height * 0.5 + 90 * this.dpr;
        let tempitem: ToggleColorButton;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i];
            const item = new ToggleColorButton(this.scene, cellwidth, 20 * this.dpr, this.dpr, data.text);
            item.on(ClickEvent.Tap, this.onToggleButtonHandler, this);
            item.x = posx + cellwidth * 0.5;
            item.y = posy;
            item.setData("item", data.type);
            item.setSize(cellwidth, cellHeight);
            this.content.add(item);
            item.setChangeColor("#FFF449");
            item.setFontSize(14 * this.dpr);
            posx += cellwidth;
            if (!tempitem) tempitem = item;
        }
        this.onToggleButtonHandler(undefined, tempitem);
    }

    setTaskDatas(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_QUEST_GROUP) {
        this.mainPanel.setTaskDatas(content, this.questType);
    }

    setTaskDetail(quest: op_client.PKT_Quest) {

    }

    private onToggleButtonHandler(pointer: any, toggle: ToggleColorButton) {
        if (this.curToggleItem === toggle) return;
        if (this.curToggleItem) this.curToggleItem.changeNormal();
        this.curToggleItem = toggle;
        this.questType = toggle.getData("item");
        this.render.renderEmitter(ModuleName.PICATASK_NAME + "_questlist", this.questType);
        this.selectLine.x = toggle.x;
        // this.selectLine
    }

    private onMainPanelHandler(tag: string, data?: any) {
        if (tag === "finish") {
            this.render.renderEmitter(ModuleName.PICATASK_NAME + "_submitquest", data);
        } else if (tag === "go") {

        } else if (tag === "detail") {
            // this.render.renderEmitter(ModuleName.PICATASK_NAME + "_questdetail", { id: data, type: this.questType });
        } else if (tag === "reward") {
            this.render.renderEmitter(ModuleName.PICATASK_NAME + "_queryreward", this.questType);
        }
    }
    private OnClosePanel() {
        this.render.renderEmitter(ModuleName.PICATASK_NAME + "_hide");
    }
}
