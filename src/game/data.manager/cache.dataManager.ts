import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BaseHandler } from "./base.handler";
export class CacheDataManager extends BaseHandler {
    private mCurRoomID: string;
    private mCurRoom: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO;
    constructor(game: Game, event: EventDispatcher) {
        super(game, event);
    }
    clear() {
        super.clear();
        this.mCurRoom = undefined;
        this.mCurRoomID = undefined;
    }

    destroy() {
        super.destroy();
        this.mCurRoom = undefined;
        this.mCurRoomID = undefined;
    }

    get curRoomID() {
        return this.mCurRoomID;
    }
    set curRoom(room: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO) {
        if (!this.mCurRoom) this.mCurRoom = room;
        else Object.assign(this.mCurRoom, room);
        this.mCurRoomID = this.mCurRoom.roomId;
        this.mEvent.emit(EventType.UPDATE_ROOM_INFO, room);
        this.mEvent.emit(EventType.UPDATE_PARTY_STATE, room.openingParty);
    }

    get curRoom() {
        return this.mCurRoom;
    }
}
