import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BaseDataManager } from "./base.dataManager";
import { CacheDataManager } from "./cache.dataManager";
import { ElementDataManager } from "./element.dataManager";
export class DataManager {
    private mEvent: EventDispatcher;
    private cacheMgr: CacheDataManager;
    private baseMgr: BaseDataManager;
    private eleMgr: ElementDataManager;
    constructor(game: Game) {
        this.mEvent = new EventDispatcher();
        this.init();
    }

    get emitter(): EventDispatcher {
        return this.mEvent;
    }

    public init() {
    }
    public addPackListener() {
    }

    public removePackListener() {
    }

    public emit(type: string, data?: any) {
        this.mEvent.emit(type, data);
    }

    on(event: string, fn: Function, context: any) {
        this.mEvent.on(event, context, fn);
    }

    off(event: string, fn: Function, context: any) {
        this.mEvent.off(event, context, fn);
    }
    clear() {
        this.removePackListener();
        this.mEvent.offAll();
    }

    destroy() {
        this.removePackListener();
        this.mEvent.destroy();
    }

    getDataMgr<T>(type: DataMgrType) {
        let data: any;
        if (type === DataMgrType.CacheMgr) {
            data = (this.cacheMgr);
        } else if (type === DataMgrType.BaseMgr) {
            data = (this.baseMgr);
        } else if (type === DataMgrType.EleMgr) {
            data = (this.eleMgr);
        }
        if (data) return <T>data;
        return null;
    }
}
export enum DataMgrType {
    BaseMgr,
    CacheMgr,
    EleMgr
}
