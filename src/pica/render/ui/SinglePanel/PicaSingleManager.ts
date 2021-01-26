import { UiManager } from "src/render/ui";
import { Logger } from "utils";
import { PicaBasePanel } from "../pica.base.panel";

export class PicaSingleManager {
    static Intsance: PicaSingleManager;
    protected singleMap: Map<string, any> = new Map();
    // protected uiMgr: UiManager;
    constructor(private uiMgr: UiManager) {
        this.uiMgr = uiMgr;
        PicaSingleManager.Intsance = this;
    }

    public destroy() {
        this.clearSingleMap();
    }
    protected clearSingleMap() {
        const map = this.singleMap;
        map.forEach((value, key) => {
            value.destroy();
            Logger.getInstance().debug(value);
        });
        map.clear();
    }
    // tslint:disable-next-line:member-ordering
    static createSinglePanel<T extends PicaBasePanel>(c: new (p: UiManager) => T) {
        const inst = this.Intsance;
        const panel = new c(this.Intsance.uiMgr);
        inst.singleMap.set(c.name, panel);
        return panel;
    }
}
