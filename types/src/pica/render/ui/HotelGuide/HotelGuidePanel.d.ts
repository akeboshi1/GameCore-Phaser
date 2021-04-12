import { UiManager } from "gamecoreRender";
import { BaseHotelGuidePanel } from "./BaseHotelGuidePanel";
export declare class HotelGuidePanel extends BaseHotelGuidePanel {
    private mPartyNavigationPanel;
    private myRoomPanel;
    private room;
    constructor(uiManager: UiManager);
    end(): void;
    protected step3(pos: any): void;
    protected step4(): void;
    protected step5(): void;
    protected step6(): void;
}
