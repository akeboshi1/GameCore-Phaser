import { CheckBox, NineSlicePatch, ClickEvent, Button } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { op_client, op_pkt_def } from "pixelpai_proto";
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
import { PicaNewSceneInfoPanel } from "./PicaNewSceneInfoPanel";
export class PicaNewMainPanel extends PicaBasePanel {

    protected activityPanel: PicaNewActivityPanel;
    protected chatPanel: PicaNewChatPanel;
    protected headPanel: PicaNewHeadPanel;
    protected leftPanel: PicaNewLeftPanel;
    protected navigatePanel: PicaNewNavigatePanel;
    protected scenePanel: PicaNewSceneInfoPanel;
    constructor(uiManager: UiManager) {
        super(uiManager);
        this.atlasNames = [UIAtlasName.uicommon];
        this.key = ModuleName.PICAMAINUI_NAME;
    }

    resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
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

    setPlayerInfo(player: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO) {

    }

    setRoomInfo(room: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {

    }

    updateUIState(active?: any) {

    }
    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.headPanel = new PicaNewHeadPanel(this.scene, width, 70 * this.dpr, this.key, this.dpr);
        this.add(this.headPanel);
        this.leftPanel = new PicaNewLeftPanel(this.scene, 40 * this.dpr, 189 * this.dpr, this.key, this.dpr);
        this.resize(width, height);
        super.init();
    }

    private onOpenRoomPanel() {
        this.render.renderEmitter("openroompanel");
    }
    private onHeadHandler() {
        this.render.renderEmitter("showPanel", ModuleName.CHARACTERINFO_NAME);
    }

    private onPraiseHandler(praise: boolean) {
        this.render.renderEmitter(EventType.QUERY_PRAISE, praise);
    }

    private onPartyHandler() {
        this.render.renderEmitter("showPanel", ModuleName.PICAOPENPARTY_NAME);
    }
    private onOpenRechargeHandler() {
        this.render.renderEmitter("showPanel", ModuleName.PICARECHARGE_NAME);
    }
}
