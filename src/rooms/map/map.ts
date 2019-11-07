import { WorldService } from "../../game/world.service";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { MapModel } from "./map.model";
import { MessageType } from "../../const/MessageType";
import { PacketHandler } from "net-socket-packet";
import { IEntity } from "../entity";

export class Map extends PacketHandler implements IEntity {
    public static NAME: string = "Map";
    private mInitialize: boolean;
    private mMapModel: MapModel;
    private emitter: Phaser.Events.EventEmitter;
    constructor(private mWorld: WorldService) {
        super();
        this.emitter = this.mWorld.emitter;
        this.mMapModel = new MapModel();
    }

    public initialize(): boolean {
        return this.mInitialize;
    }

    public getMapModel(): MapModel {
        return this.mMapModel;
    }

    public register() {
    }

    public unRegister() {
    }

    public destroy() {
        this.mInitialize = false;
        this.mMapModel = null;
        this.emitter = null;
    }

    public setMapInfo(value: op_client.IScene): void {
        this.mMapModel.mapId = value.id;
        this.mMapModel.voiceChatRoomId = value.voiceChatRoomId;
        this.mMapModel.setConfig(value.cols, value.rows, value.zStart, value.zEnd, value.tileWidth, value.tileHeight);
        this.mMapModel.setTerrainInfo(value.terrains);
        this.mMapModel.setElementInfo(value.elements);
        if (this.mInitialize === false) {
            this.mInitialize = true;
            this.emitter.emit(MessageType.SCENE_DATA_INITIALIZE);
        }
    }

    public addPackItems(elementId: number, items: op_gameconfig.IItem[]) {
        this.mMapModel.addPackItems(elementId, items);
    }

    public removePackItems(elementId: number, itemId: number) {
        this.mMapModel.removePackItems(elementId, itemId);
    }
}
