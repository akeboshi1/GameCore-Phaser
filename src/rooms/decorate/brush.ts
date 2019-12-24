import {op_client} from "pixelpai_proto";
import {DecorateRoom} from "../decorate.room";

export class Brush {
    constructor(private mScene: Phaser.Scene, private mRoomService: DecorateRoom) {
    }

    setDisplay(content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE) {

    }

}
