import { UiManager } from "gamecoreRender";
import { PicaPartyNavigationPanel } from "picaRender";
import { ModuleName } from "structure";
import { BaseHotelGuidePanel } from "./BaseHotelGuidePanel";
export class HotelGuide2Panel extends BaseHotelGuidePanel {
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

    protected step4() {
        this.mPartyNavigationPanel = this.uiManager.getPanel(ModuleName.PICAPARTYNAVIGATION_NAME) as PicaPartyNavigationPanel;
        this.render.emitter.on(PicaPartyNavigationPanel.PICASELFROOM_DATA, this.step5, this);
    }

    protected step5() {
        this.render.emitter.off(PicaPartyNavigationPanel.PICASELFROOM_DATA, this.step5, this);
        this.render.emitter.on(PicaPartyNavigationPanel.PicaPartyNavigationPanel_CLOSE, this.end, this);
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
        const roomList = item.townItems;
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
        this.guideEffect.createGuideEffect({ x: worldMatrix.tx, y: worldMatrix.ty });
        this.room.on("pointerdown", this.end, this);
    }
}
