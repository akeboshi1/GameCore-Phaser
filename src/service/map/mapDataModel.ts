import { IBaseModel } from "../baseModel";
import { WorldService } from "../../game/world.service";
import { IFramesModel, FramesModel } from "../../rooms/display/frames.model";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { MapInfo } from "./mapInfo";
import { MessageType } from "../../const/MessageType";

export class MapDataModel implements IBaseModel {
    public static NAME: string = "MapDataModel";
    public initialize: boolean;
    private mMapInfo: MapInfo;
    private mModelDispatch: Phaser.Events.EventEmitter;

    constructor(private mWorld: WorldService) {
        if (this.mWorld.modelManager) {
            this.mModelDispatch = this.mWorld.modelManager;
        }
        this.mMapInfo = new MapInfo();
    }

    public getInitialize(): boolean {
        return this.initialize;
    }

    public geMapInfo(): MapInfo {
        return this.mMapInfo;
    }

    public setMapInfo(value: op_client.IScene): void {
        this.mMapInfo.mapId = value.id;
        this.mMapInfo.voiceChatRoomId = value.voiceChatRoomId;
        this.mMapInfo.setConfig(value.cols, value.rows, value.zStart, value.zEnd, value.tileWidth, value.tileHeight);
        this.mMapInfo.setTerrainInfo(value.terrains);
        this.mMapInfo.setElementInfo(value.elements);
        if (this.initialize === false) {
            this.initialize = true;
            this.mModelDispatch.emit(MessageType.SCENE_DATA_INITIALIZE);
        }
    }

    public addPackItems(elementId: number, items: op_gameconfig.IItem[]) {
        this.mMapInfo.addPackItems(elementId, items);
    }

    public removePackItems(elementId: number, itemId: number) {
        this.mMapInfo.removePackItems(elementId, itemId);
    }
}
