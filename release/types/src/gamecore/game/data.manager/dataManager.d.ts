import { EventDispatcher } from "structure";
import { Game } from "../game";
import { DataMgrType } from "./data.mgr.type";
export declare class DataManager {
    private mGame;
    private mEvent;
    private mPackMap;
    private mDataMap;
    constructor(game: Game);
    initPackMap(): void;
    initDataMap(): void;
    get emitter(): EventDispatcher;
    init(): void;
    addPackListener(): void;
    removePackListener(): void;
    emit(type: string, data: any, dataType: DataMgrType): void;
    on(event: string, fn: Function, context: any, dataType: DataMgrType): void;
    off(event: string, fn: Function, context: any, dataType: DataMgrType): void;
    clear(): void;
    destroy(): void;
    getDataMgr<T>(type: DataMgrType): T;
    getEvent(dataType?: DataMgrType): any;
}
