import { ClickEvent, Button } from "apowophaserui";
import { UIAtlasName } from "../../../res";
import { op_pkt_def, op_def } from "pixelpai_proto";
import { UiManager } from "gamecoreRender";
import { EventType, ModuleName } from "structure";
import { Handler, i18n } from "utils";
import { PicaBasePanel } from "../pica.base.panel";
import { PicaNewActivityPanel } from "./PicaNewActivityPanel";
import { PicaNewChatPanel } from "./PicaNewChatPanel";
import { PicaNewHeadPanel } from "./PicaNewHeadPanel";
import { PicaNewLeftPanel } from "./PicaNewLeftPanel";
import { UITools } from "../uitool";
// import { PicaNewNavigatePanel } from "./PicaNewNavigatePanel";
export class PicaNewMainPanel extends PicaBasePanel {
    public leftPanel: PicaNewLeftPanel;
    public activityPanel: PicaNewActivityPanel;
    protected chatPanel: PicaNewChatPanel;
    protected headPanel: PicaNewHeadPanel;
    // protected navigatePanel: PicaNewNavigatePanel;
    protected foldButton: Button;
    private isFold: boolean = false;
    private headData: any;
    private sceneData: any;
    private isSelfRoom: boolean = false;
    private redMap: Map<number, Phaser.GameObjects.Image> = new Map();
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.iconcommon];
        this.key = ModuleName.PICANEWMAIN_NAME;
        this.maskLoadingEnable = false;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.foldButton.x = 15 * this.dpr;
        this.foldButton.y = 15 * this.dpr + 10 * this.dpr;
        this.headPanel.x = width * 0.5;
        this.headPanel.y = this.headPanel.height * 0.5 + 20 * this.dpr;
        this.leftPanel.x = this.leftPanel.width * 0.5 + 10 * this.dpr;
        this.leftPanel.y = this.headPanel.height + this.leftPanel.height * 0.5 + 20 * this.dpr;
        this.activityPanel.x = width - this.activityPanel.width * 0.5 - 10 * this.dpr;
        this.activityPanel.y = this.headPanel.height + this.activityPanel.height * 0.5 + 0 * this.dpr;
        // this.navigatePanel.x = width * 0.5;
        // this.navigatePanel.y = height - this.navigatePanel.height * 0.5;
        // this.chatPanel.x = width * 0.5;
        // this.chatPanel.y = height - this.navigatePanel.height - this.chatPanel.height * 0.5;
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

    onShow() {
        this.checkUpdateActive();
        if (this.tempDatas) this.setRedsState(this.tempDatas);
    }
    update(param) {
        super.update();
    }

    setPlayerInfo(level: op_pkt_def.IPKT_Level, energy: op_def.IValueBar, money: number, diamond: number) {
        this.headData = { level, energy, money, diamond };
        if (!this.mInitialized) return;
        this.headPanel.setHeadData(level, energy, money, diamond);
    }

    setRoomInfo(sceneName: string, Praise: number, isPraise: boolean, people: number, roomType: string, isself: boolean = false) {
        this.sceneData = { sceneName, isPraise, people, roomType, isself };
        if (!this.mInitialized) return;
        this.headPanel.setSceneData(sceneName, Praise, isPraise, people, roomType, isself);
        this.isSelfRoom = isself;
    }

    updateUIState(active?: any) {
        if (!this.mInitialized) return;
        this.activityPanel.updateUIState(active);
        this.leftPanel.updateUIState(active);
    }
    public setRedsState(reds: number[]) {
        this.tempDatas = reds;
        if (!this.mInitialized) return;
        this.redMap.forEach((value, key) => {
            value.visible = reds.indexOf(key) !== -1;
        });
    }
    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.foldButton = new Button(this.scene, UIAtlasName.uicommon, "home_retract");
        this.foldButton["setInteractiveSize"](50 * this.dpr, 50 * this.dpr);
        this.foldButton.on(ClickEvent.Tap, this.onFoldButtonHandler, this);
        this.add(this.foldButton);
        this.headPanel = new PicaNewHeadPanel(this.scene, width, 70 * this.dpr, this.key, this.dpr);
        this.headPanel.setHandler(new Handler(this, this.onHeadHandler));
        this.add(this.headPanel);
        this.leftPanel = new PicaNewLeftPanel(this.scene, 40 * this.dpr, 170 * this.dpr, this.key, this.dpr);
        this.leftPanel.setHandler(new Handler(this, this.onLeftHandler));
        this.add(this.leftPanel);
        this.activityPanel = new PicaNewActivityPanel(this.render, this.scene, 40 * this.dpr, 170 * this.dpr, this.key, this.dpr);
        this.activityPanel.setHandler(new Handler(this, this.onActivityHandler));
        this.add(this.activityPanel);
        this.chatPanel = new PicaNewChatPanel(this.scene, width, 201 * this.dpr, this.key, this.dpr);
        this.add(this.chatPanel);
        // this.navigatePanel = new PicaNewNavigatePanel(this.scene, width, 56 * this.dpr, this.key, this.dpr);
        // this.navigatePanel.setHandler(new Handler(this, this.onNavigateHandler));
        // this.add(this.navigatePanel);
        this.creatRedMap();
        this.resize(width, height);
        super.init();
    }

    public fetchFoldButton(fold: boolean) {
        this.isFold = !fold;
        this.onFoldButtonHandler();
    }
    protected onInitialized() {
        if (this.headData) this.headPanel.setHeadData(this.headData.level, this.headData.energy, this.headData.money, this.headData.diamond);
        if (this.sceneData) this.headPanel.setSceneData(this.sceneData.sceneName, this.sceneData.isPraise, this.sceneData.people, this.sceneData.roomType, this.sceneData.isself);
    }
    private creatRedMap() {
        const activity = this.activityPanel.redMap;
        const left = this.leftPanel.redMap;
        activity.forEach((value, key) => {
            const img = UITools.creatRedImge(this.scene, value);
            this.redMap.set(key, img);
        });
        left.forEach((value, key) => {
            const img = UITools.creatRedImge(this.scene, value);
            this.redMap.set(key, img);
        });
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
            // this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.CHARACTERINFO_NAME);
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAPLAYERINFO_NAME);
        } else if (tag === "energy") {
            // this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showPanel", ModuleName.PICARECHARGE_NAME);
        } else if (tag === "praise") {
            this.render.renderEmitter(EventType.QUERY_PRAISE, data);
        } else if (tag === "recharge") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICARECHARGE_NAME);
        } else if (tag === "room") {
            if (this.isSelfRoom) this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_openhousepanel");
        } else if (tag === "party") {
            // this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAOPENPARTY_NAME);
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_querydecorate");
        } else if (tag === "online") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAONLINE_NAME);
        } else if (tag === "tooqing") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICASCENENAVIGATION_NAME);
        }
    }

    private onLeftHandler(tag: string, data: any) {
        if (tag === "maphome") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAPARTYNAVIGATION_NAME);
        } else if (tag === "task") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICATASK_NAME);
        }
    }

    private onActivityHandler(tag: string, data: any) {
        if (tag === "activity") {
            this.onNoticeHandler();
            return;
        }
        if (tag === "interactive") {
            this.render.mainPeer.findNearEle();
            return;
        }
        if (tag === "activity") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAORDER_NAME);
        } else if (tag === "indent") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICANEWORDER_NAME);
        } else if (tag === "recharge") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICARECHARGE_NAME);
        } else if (tag === "email") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAMAIL_NAME);
        } else if (tag === "roam") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAROAM_NAME);
        } else if (tag === "shop") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAMARKET_NAME);
        }
    }

    private onNavigateHandler(tag: string, data: any) {
        if (tag === "bag") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICABAG_NAME);
        } else if (tag === "friend") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAFRIEND_NAME);
        } else if (tag === "avatar") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAAVATAR_NAME);
        } else if (tag === "make") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAMANUFACTURE_NAME);
        } else if (tag === "explore") {
            this.render.renderEmitter(ModuleName.PICANEWMAIN_NAME + "_showpanel", ModuleName.PICAEXPLORELIST_NAME);
        }
    }
    private checkUpdateActive() {
        // this.render.mainPeer.getCurRoom()
        //     .then((curRoom) => {
        //         if (curRoom)
        //             this.setGiftButtonState(curRoom.openingParty);
        //     });
        // this.render.mainPeer.getActiveUIData(ModuleName.PICANEWMAIN_NAME)
        //     .then((arr) => {
        //         if (arr) {
        //             this.updateUIState(arr);
        //         }
        //     });
        this.render.mainPeer.refrehActiveUIState(ModuleName.PICANEWMAIN_NAME);
    }

    private onNoticeHandler() {
        const tempdata = {
            text: [{ text: i18n.t("noticeTips.staytuned"), node: undefined }]
        };
        this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
        return;
    }
}
