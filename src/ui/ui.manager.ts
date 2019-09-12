import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { IRoomService } from "../rooms/room";
import { BaseFace } from "./baseface";

export class UiManager extends PacketHandler {
    private mChatView;
    private mBaseFaceView: BaseFace;

    private mConnect: ConnectionService;
    private mRoom: IRoomService;
    constructor(private worldService: WorldService) {
        super();
        this.mConnect = worldService.connection;
    }

    public setRoom(room: IRoomService) {
        this.mRoom = room;
    }

    public setScene(scene: Phaser.Scene) {
        this.mBaseFaceView = new BaseFace(scene, this.worldService);
    }

}
