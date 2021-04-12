import { UiManager } from "src/render/ui";
import { PicaBasePanel } from "../pica.base.panel";
export declare class PicaSingleManager {
    private uiMgr;
    static Intsance: PicaSingleManager;
    protected singleMap: Map<string, any>;
    constructor(uiMgr: UiManager);
    destroy(): void;
    protected clearSingleMap(): void;
    static createSinglePanel<T extends PicaBasePanel>(c: new (p: UiManager) => T): T;
}
