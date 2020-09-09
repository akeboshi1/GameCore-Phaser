import { PacketHandler } from "net-socket-packet";
import { IEntity } from "../../entity";
import { WorldService } from "../../../game/world.service";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { op_client } from "pixelpai_proto";

export class ItemDetailEntity extends PacketHandler implements IEntity {
    private mInitialize: boolean = false;
    private mConnect: ConnectionService;
    constructor(private mWorld: WorldService) {
        super();
        this.mConnect = this.mWorld.connection;
    }

    public initialize(): boolean {
        return this.mInitialize;
    }

    public register() {
        this.mConnect.addPacketListener(this);
    }

    public unRegister() {
        this.mConnect.removePacketListener(this);
    }

    public destroy() {
        this.unRegister();
        this.mInitialize = false;
        this.mConnect = null;
    }
}
