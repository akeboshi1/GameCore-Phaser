import { Export } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { WallDisplay } from "../display/wall.display";
import { DisplayManager } from "./display.manager";

export class WallDisplayManager extends DisplayManager {

    @Export()
    public loadDisplay(displayID: number, texture: string, data: string) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as WallDisplay;
        display.loadDisplay(texture, data);
    }
    @Export()
    public setDir(displayID: number, dir: Direction) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as WallDisplay;
        display.setDir(dir);
    }
    @Export()
    public removeFromParent(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID) as WallDisplay;
        display.removeFromParent();
    }
}
