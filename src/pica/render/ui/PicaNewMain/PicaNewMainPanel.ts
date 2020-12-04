import { CheckBox, NineSlicePatch, ClickEvent, Button } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { Render } from "src/render/render";
import { TextToolTips, UiManager } from "gamecoreRender";
import { EventType, ModuleName } from "structure";
import { Font, Handler, i18n, Logger } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaNewActivityPanel } from "./PicaNewActivityPanel";
import { PicaNewChatPanel } from "./PicaNewChatPanel";
import { PicaNewHeadPanel } from "./PicaNewHeadPanel";
import { PicaNewLeftPanel } from "./PicaNewLeftPanel";
import { PicaNewNavigatePanel } from "./PicaNewNavigatePanel";
export class PicaNewMainPanel extends PicaBasePanel {

    protected activityPanel: PicaNewActivityPanel;
    protected chatPanel: PicaNewChatPanel;
    protected headPanel: PicaNewHeadPanel;
    protected leftPanel: PicaNewLeftPanel;
    protected navigatePanel: PicaNewNavigatePanel;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.iconcommon];
        this.key = ModuleName.PICANEWMAIN_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.headPanel.x = width * 0.5;
        this.headPanel.y = this.headPanel.height * 0.5;
        this.leftPanel.x = this.leftPanel.width * 0.5 - 20 * this.dpr;
        this.leftPanel.y = this.headPanel.height + this.leftPanel.height * 0.5 + 30 * this.dpr;
        this.activityPanel.x = width - this.activityPanel.width * 0.5 - 20 * this.dpr;
        this.activityPanel.y = this.headPanel.height + this.activityPanel.height * 0.5 + 30 * this.dpr;
        this.navigatePanel.x = width * 0.5;
        this.navigatePanel.y = height - this.navigatePanel.height * 0.5;
        this.chatPanel.x = width * 0.5;
        this.chatPanel.y = height - this.navigatePanel.height - this.chatPanel.height * 0.5;
        super.resize(width, height);
    }

    addListen() {
        super.addListen();
    }

    removeListen() {
        super.removeListen();
    }

    destroy() {
        super.destroy();
    }

    update(param) {
        super.update();
    }

    setPlayerInfo(level: op_pkt_def.IPKT_Level, energy: op_def.IValueBar, money: number, diamond: number) {
        this.headPanel.setHeadData(level, energy, money, diamond);
    }

    setRoomInfo(sceneName: string, isPraise: boolean, people: number) {
        this.headPanel.setSceneData(sceneName, isPraise, people);
    }

    updateUIState(active?: any) {

    }
    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.headPanel = new PicaNewHeadPanel(this.scene, width, 70 * this.dpr, this.key, this.dpr);
        this.headPanel.setHandler(new Handler(this, this.onHeadHandler));
        this.add(this.headPanel);
        this.leftPanel = new PicaNewLeftPanel(this.scene, 40 * this.dpr, 189 * this.dpr, this.key, this.dpr);
        this.add(this.leftPanel);
        this.activityPanel = new PicaNewActivityPanel(this.scene, 40 * this.dpr, 180 * this.dpr, this.key, this.dpr);
        this.add(this.activityPanel);
        this.chatPanel = new PicaNewChatPanel(this.scene, width, 201 * this.dpr, this.key, this.dpr);
        this.add(this.chatPanel);
        this.navigatePanel = new PicaNewNavigatePanel(this.scene, width, 48 * this.dpr, this.key, this.dpr);
        this.add(this.navigatePanel);
        this.resize(width, height);
        super.init();
    }

    private onOpenRoomPanel() {
        this.render.renderEmitter("openroompanel");
    }
    private onHeadHandler(tag: string, data: any) {
        if (tag === "head") {
            this.render.renderEmitter("showPanel", ModuleName.CHARACTERINFO_NAME);
        } else if (tag === "energy") {
            // this.render.renderEmitter("showPanel", ModuleName.CHARACTERINFO_NAME);
        } else if (tag === "praise") {
            this.render.renderEmitter(EventType.QUERY_PRAISE, data);
        } else if (tag === "recharge") {
            this.render.renderEmitter("showPanel", ModuleName.PICARECHARGE_NAME);
        }
    }
}
