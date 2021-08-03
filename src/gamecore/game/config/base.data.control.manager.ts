import { EventDispatcher } from "structure";
import { Game } from "../game";
import { BaseDataHandler } from "./handler/base.data.handler";
import { BaseDataPacketHandler } from "./handler/base.data.packet.handler";
export class BaseDataControlManager {
    protected mGame: Game;
    protected mEvent: EventDispatcher;
    protected mPackMap: Map<DataMgrType, BaseDataPacketHandler>;
    protected mDataMap: Map<DataMgrType, BaseDataHandler>;
    constructor(game: Game) {
        this.mGame = game;
        this.mEvent = new EventDispatcher();
        this.mPackMap = new Map();
        this.mDataMap = new Map();
        this.initPackMap();
        this.initDataMap();
    }
    public initPackMap() {
    }

    public initDataMap() {
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
    CommonMgr,
    ChatMgr
}
