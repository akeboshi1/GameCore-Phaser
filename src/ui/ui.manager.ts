import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { PacketHandler } from "net-socket-packet";
import { IRoomService } from "../rooms/room";
import { ChatPanel } from "./chatPanel";
import { Size } from "../utils/size";
import { IBag } from "./bag/basebag";
import { BagPanelMobile } from "./bag/bagPanel.mobile";
import { BagPanelPC } from "./bag/bagPanel.pc";

export class UiManager extends PacketHandler {
    private mChatView: ChatPanel;
    private mBagPanel: IBag;

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
        const size: Size = this.worldService.getSize();
        if (this.worldService.game.device.os.desktop) {
            this.mBagPanel = new BagPanelPC(scene, this.worldService, size.width >> 1, size.height - 50);
        } else {
            this.mBagPanel = new BagPanelMobile(scene, this.worldService, size.width >> 1, size.height - 100);
        }
    }

}
