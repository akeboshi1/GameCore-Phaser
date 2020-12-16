import { ClickEvent, Button } from "apowophaserui";
import { UIAtlasName } from "picaRes";
import { op_pkt_def, op_def } from "pixelpai_proto";
import { UiManager } from "gamecoreRender";
import { EventType, ModuleName } from "structure";
import { Handler} from "utils";
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
    protected foldButton: Button;
    private isFold: boolean = false;
    private headData: any;
    private sceneData: any;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.iconcommon];
        this.key = ModuleName.PICANEWMAIN_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.foldButton.x = this.foldButton.width * 0.5 + 5 * this.dpr;
        this.foldButton.y = this.foldButton.height * 0.5 + 5 * this.dpr;
        this.headPanel.x = width * 0.5;
        this.headPanel.y = this.headPanel.height * 0.5;
        this.leftPanel.x = this.leftPanel.width * 0.5 + 10 * this.dpr;
        this.leftPanel.y = this.headPanel.height + this.leftPanel.height * 0.5 + 20 * this.dpr;
        this.activityPanel.x = width - this.activityPanel.width * 0.5 - 10 * this.dpr;
        this.activityPanel.y = this.headPanel.height + this.activityPanel.height * 0.5 + 0 * this.dpr;
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

    hide() {
        super.hide();
    }

    update(param) {
        super.update();
    }

    setPlayerInfo(level: op_pkt_def.IPKT_Level, energy: op_def.IValueBar, money: number, diamond: number) {
        this.headData = { level, energy, money, diamond };
        if (!this.mInitialized) return;
        this.headPanel.setHeadData(level, energy, money, diamond);
    }

    setRoomInfo(sceneName: string, isPraise: boolean, people: number, roomType: string, isself: boolean = false) {
        this.sceneData = { sceneName, isPraise, people, roomType, isself };
        if (!this.mInitialized) return;
        this.headPanel.setSceneData(sceneName, isPraise, people, roomType, isself);
    }

    updateUIState(active?: any) {

    }
    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.foldButton = new Button(this.scene, UIAtlasName.uicommon, "home_retract");
        this.foldButton.on(ClickEvent.Tap, this.onFoldButtonHandler, this);
        this.add(this.foldButton);
        this.headPanel = new PicaNewHeadPanel(this.scene, width, 70 * this.dpr, this.key, this.dpr);
        this.headPanel.setHandler(new Handler(this, this.onHeadHandler));
        this.add(this.headPanel);
        this.leftPanel = new PicaNewLeftPanel(this.scene, 40 * this.dpr, 170 * this.dpr, this.key, this.dpr);
        this.leftPanel.setHandler(new Handler(this, this.onLeftHandler));
        this.add(this.leftPanel);
        this.activityPanel = new PicaNewActivityPanel(this.scene, 40 * this.dpr, 170 * this.dpr, this.key, this.dpr);
        this.activityPanel.setHandler(new Handler(this, this.onActivityHandler));
        this.add(this.activityPanel);
        this.chatPanel = new PicaNewChatPanel(this.scene, width, 201 * this.dpr, this.key, this.dpr);
        this.add(this.chatPanel);
        this.navigatePanel = new PicaNewNavigatePanel(this.scene, width, 56 * this.dpr, this.key, this.dpr);
        this.navigatePanel.setHandler(new Handler(this, this.onNavigateHandler));
        this.add(this.navigatePanel);
        this.resize(width, height);
        super.init();
    }

    protected onInitialized() {
        if (this.headData) this.headPanel.setHeadData(this.headData.level, this.headData.energy, this.headData.money, this.headData.diamond);
        if (this.sceneData) this.headPanel.setSceneData(this.sceneData.sceneName, this.sceneData.isPraise, this.sceneData.people, this.sceneData.roomType, this.sceneData.isself);
    }

    private onFoldButtonHandler() {
        this.isFold = !this.isFold;
        if (this.isFold) {
            this.foldButton.setFrameNormal("home_spread", "home_spread");
            this.headPanel.visible = false;
            this.leftPanel.visible = false;
            this.activityPanel.visible = false;
        } else {
            this.foldButton.setFrameNormal("home_retract", "home_retract");
            this.headPanel.visible = true;
            this.leftPanel.visible = true;
            this.activityPanel.visible = true;
        }
    }

    private onHeadHandler(tag: string, data: any) {
        if (tag === "head") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.CHARACTERINFO_NAME);
        } else if (tag === "energy") {
            // this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showPanel", ModuleName.PICARECHARGE_NAME);
        } else if (tag === "praise") {
            this.render.renderEmitter(EventType.QUERY_PRAISE, data);
        } else if (tag === "recharge") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICARECHARGE_NAME);
        } else if (tag === "room") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_openhousepanel");
        } else if (tag === "party") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAOPENPARTY_NAME);
        } else if (tag === "online") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAONLINE_NAME);
        }
    }

    private onLeftHandler(tag: string, data: any) {
        if (tag === "maphome") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAPARTYLIST_NAME);
        } else if (tag === "task") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICATASK_NAME);
        }
    }

    private onActivityHandler(tag: string, data: any) {
        if (tag === "activity") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAORDER_NAME);
        } else if (tag === "indent") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAPARTYLIST_NAME);
        } else if (tag === "recharge") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICATASK_NAME);
        } else if (tag === "email") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAEFFECTMGR_NAME);
        }
    }

    private onNavigateHandler(tag: string, data: any) {
        if (tag === "bag") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICABAG_NAME);
        } else if (tag === "friend") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAFRIEND_NAME);
        } else if (tag === "avatar") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAAVATAR_NAME);
        } else if (tag === "shop") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAMARKET_NAME);
        } else if (tag === "vip") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICARECHARGE_NAME);
        }
    }
}
