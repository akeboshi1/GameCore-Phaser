import {op_client} from "pixelpai_proto";
import {DecorateRoom} from "../decorate.room";
import { RoomLayerManager } from "../layer/room.layer.manager";

export class Brush {
    private mLayerManager: RoomLayerManager;
    constructor(private mScene: Phaser.Scene, private mRoomService: DecorateRoom) {
        this.mLayerManager = this.mRoomService.layerManager;
    }

    setDisplay(content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE) {

    }

}
