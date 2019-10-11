import { IBaseModel } from "../baseModel";
import { PacketHandler } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";

export class StorageModel extends PacketHandler implements IBaseModel {
    public static NAME: string = "StorageModel";
    public initialize: boolean = false;
    private mConnect: ConnectionService;
    constructor(private mWorld: WorldService) {
        super();
        this.mWorld.connection.addPacketListener(this);
        this.mConnect = this.mWorld.connection;
    }
    public getInitialize(): boolean {
        return this.initialize;
    }
    public register() {

    }
    public unRegister() {

    }
}
