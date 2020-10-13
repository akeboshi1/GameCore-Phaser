import { Export } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { FramesDisplay } from "../display/frames.display";
import { DisplayManager, IDisplayManagerService } from "./display.manager";

export class FrameDisplayManager extends DisplayManager {

    @Export()
    public playEffect(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as FramesDisplay;
        display.playEffect();
    }
    @Export()
    public setInteractive(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as FramesDisplay;
        display.setInteractive();
    }
    @Export()
    public disableInteractive(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as FramesDisplay;
        display.disableInteractive();
    }
}
