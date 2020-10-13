import { Export } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { DisplayField } from "../display/display.object";
import { FramesDisplay } from "../display/frames.display";
import { DisplayManager, IDisplayManagerService } from "./display.manager";

export class FrameDisplayManager extends DisplayManager {

    @Export()
    public load(displayID: number, displayInfo: IFramesModel, field?: DisplayField) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as FramesDisplay;
        display.load(displayInfo, field);
    }
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
    public scaleTween(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as FramesDisplay;
        display.scaleTween();
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
    @Export()
    public removeEffect(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as FramesDisplay;
        display.removeEffect();
    }
}
