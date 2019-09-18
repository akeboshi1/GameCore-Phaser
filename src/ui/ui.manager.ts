import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { IRoomService } from "../rooms/room";
import { ChatPanel } from "./chatPanel";
import { BagPanel } from "./bagPanel";

export class UiManager extends PacketHandler {
    private mChatView: ChatPanel;
    private mBagPanel: BagPanel;

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
        if (this.worldService.game.device.os.desktop) {
        } else {
            this.mBagPanel = new BagPanel(scene, this.worldService);
        }
    }

}
