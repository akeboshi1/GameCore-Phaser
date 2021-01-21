import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BaseDataManager } from "./base.dataManager";
import { BaseHandler } from "./base.handler";
import { BasePacketHandler } from "./base.packet.handler";
import { CacheDataManager } from "./cache.dataManager";
import { CommonDataManager } from "./common.data.manager";
import { ElementDataManager } from "./element.dataManager";
import { SceneDataManager } from "./scene.data.manager";
export class DataManager {
    private mGame: Game;
    private mEvent: EventDispatcher;
    private mPackMap: Map<DataMgrType, BasePacketHandler>;
    private mDataMap: Map<DataMgrType, BaseHandler>;
    constructor(game: Game) {
        this.mGame = game;
        this.mEvent = new EventDispatcher();
        this.mPackMap = new Map();
        this.mDataMap = new Map();
        this.initPackMap();
        this.initDataMap();
    }
    public initPackMap() {
        const baseMgr = new BaseDataManager(this.mGame, this.mEvent);
        const sceneMgr = new SceneDataManager(this.mGame, this.mEvent);
        const commonMgr = new CommonDataManager(this.mGame, this.mEvent);
        this.mPackMap.set(DataMgrType.BaseMgr, baseMgr);
        this.mPackMap.set(DataMgrType.SceneMgr, sceneMgr);
        this.mPackMap.set(DataMgrType.CommonMgr, commonMgr);
    }

    public initDataMap() {
        const cacheMgr = new CacheDataManager(this.mGame, this.mEvent);
        const eleMgr = new ElementDataManager(this.mGame, this.mEvent);
        this.mDataMap.set(DataMgrType.CacheMgr, cacheMgr);
        this.mDataMap.set(DataMgrType.EleMgr, eleMgr);

    }
    get emitter(): EventDispatcher {
        return this.mEvent;
    }

    public init() {
    }
    public addPackListener() {
        this.mPackMap.forEach((value) => {
            value.addPackListener();
        });
    }

    public removePackListener() {
        this.mPackMap.forEach((value) => {
            value.removePackListener();
        });
    }

    public emit(type: string, data: any, dataType: DataMgrType) {
        const mEvent = this.getEvent(dataType);
        mEvent.emit(type, data);
    }

    on(event: string, fn: Function, context: any, dataType: DataMgrType) {
        const mEvent = this.getEvent(dataType);
        mEvent.on(event, context, fn);
    }

    off(event: string, fn: Function, context: any, dataType: DataMgrType) {
        const mEvent = this.getEvent(dataType);
        mEvent.off(event, context, fn);
    }
    clear() {
        this.removePackListener();
        this.mEvent.offAll();
        this.mPackMap.forEach((value) => {
            value.clear();
        });
        this.mDataMap.forEach((value) => {
            value.clear();
        });
    }

    destroy() {
        this.removePackListener();
        this.mEvent.destroy();
        this.mPackMap.forEach((value) => {
            value.destroy();
        });
        this.mDataMap.forEach((value) => {
            value.destroy();
        });
    }

    getDataMgr<T>(type: DataMgrType) {
        let data: any;
        if (this.mPackMap.has(type)) {
            data = this.mPackMap.get(type);
        } else if (this.mDataMap.has(type)) {
            data = this.mDataMap.get(type);
        }
        if (data) return <T>data;
        return null;
    }

    getEvent(dataType?: DataMgrType) {
        const mEvent = !dataType ? this.mEvent : this.getDataMgr<any>(dataType).Event;
        return mEvent;
    }
}
export enum DataMgrType {
    None,
    BaseMgr,
    CacheMgr,
    EleMgr,
    SceneMgr,
    CommonMgr
}
