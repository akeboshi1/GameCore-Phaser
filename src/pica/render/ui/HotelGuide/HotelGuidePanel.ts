import { ClickEvent } from "apowophaserui";
import { UiManager } from "gamecoreRender";
import { PicaMyNavigationPanel, PicaPartyNavigationPanel, PicaTaskPanel } from "../../../render";
import { ModuleName } from "structure";
import { BaseHotelGuidePanel } from "./BaseHotelGuidePanel";
export class HotelGuidePanel extends BaseHotelGuidePanel {
    private mPartyNavigationPanel;
    private myRoomPanel;
    private room;
    constructor(uiManager: UiManager) {
        super(uiManager);
    }

    public end() {
        this.room.off("pointerdown", this.end, this);
        this.render.emitter.off(PicaPartyNavigationPanel.PicaPartyNavigationPanel_CLOSE, this.end, this);
        super.end();
    }

    protected step3(pos) {
        this.taskButton.off(ClickEvent.Tap, this.step2, this);
        this.render.emitter.off(PicaTaskPanel.PICATASK_DATA, this.step3, this);
        const taskPanel: PicaTaskPanel = this.uiManager.getPanel(ModuleName.PICATASK_NAME) as PicaTaskPanel;
        const picaMainTaskPanel: any = taskPanel.mainPanel;
        const list: any[] = picaMainTaskPanel.taskItems;
        const item = list[0];
        if (!item) this.end();
        this.itemTaskBtn = item.taskButton;
        const worldMatrix = this.itemTaskBtn.getWorldTransformMatrix();
        const scalx = worldMatrix.scaleX;
        const posx = (item.width - this.itemTaskBtn.width * 0.5) * scalx;
        this.guideEffect.createGuideEffect({ x: posx, y: worldMatrix.ty },this.mData.guideText[2]);
        this.itemTaskBtn.on(ClickEvent.Tap, this.step4, this);
    }

    protected step4() {
        this.render.emitter.on(PicaPartyNavigationPanel.PICASELFROOM_DATA, this.step5, this);
    }

    protected step5() {
        this.mPartyNavigationPanel = this.uiManager.getPanel(ModuleName.PICAPARTYNAVIGATION_NAME) as PicaPartyNavigationPanel;
        this.render.emitter.on(PicaPartyNavigationPanel.PicaPartyNavigationPanel_CLOSE, this.end, this);
        this.render.emitter.off(PicaPartyNavigationPanel.PICASELFROOM_DATA, this.step5, this);
        this.myRoomPanel = this.mPartyNavigationPanel.myRoomPanel;
        if (this.myRoomPanel) {
            this.step6();
            return;
        }
        this.render.emitter.on(PicaMyNavigationPanel.PICAMYNAVIGATIONPANEL_DATA, this.step6, this);
    }
    protected step6() {
        this.render.emitter.off(PicaMyNavigationPanel.PICAMYNAVIGATIONPANEL_DATA, this.step6, this);
        this.myRoomPanel = this.mPartyNavigationPanel.myRoomPanel;
        const items = this.myRoomPanel.roomsItems;
        if (!items) {
            this.end();
            return;
        }
        const item = items[0];
        if (!item) {
            this.end();
            return;
        }
        const roomList = item.roomList();
        if (!roomList) {
            this.end();
            return;
        }
        this.room = roomList[0];
        if (!this.room) {
            this.end();
            return;
        }
        const worldMatrix = this.room.getWorldTransformMatrix();
        const x = this.mPartyNavigationPanel.width * 0.5 / worldMatrix.scaleX;
        this.guideEffect.createGuideEffect({ x, y: worldMatrix.ty },this.mData.guideText[5]);
        this.room.on("pointerdown", this.end, this);
    }
}
