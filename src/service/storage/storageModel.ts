import { IBaseModel } from "../baseModel";
import { PacketHandler } from "net-socket-packet";

export class StorageModel extends PacketHandler implements IBaseModel {
    public static NAME: string = "StorageModel";
    public initialize: boolean = false;
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
