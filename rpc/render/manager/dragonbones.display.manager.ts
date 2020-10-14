import { Export } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { DisplayManager } from "./display.manager";

export class DragonbonesDisplayManager extends DisplayManager {

    @Export()
    public setDisplayInfo(displayID: number, val: IDragonbonesModel | undefined) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as DragonbonesDisplay;
        display.displayInfo = val;
    }
    @Export()
    public play(displayID: number, val: AnimationData) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as DragonbonesDisplay;
        display.play(val);
    }
}
