import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
export class PlayerProperty {
    public playerInfo: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
    public coin: op_pkt_def.PKT_Property;
    public diamond: op_pkt_def.PKT_Property;
    public level: op_pkt_def.PKT_Property;
    public energy: op_pkt_def.PKT_Property;
    public workChance: op_pkt_def.PKT_Property;
    public rooms: op_client.IEditModeRoom[];
    public handheld: op_client.ICountablePackageItem[];
    public command: op_def.OpCommand;
    public properties: op_pkt_def.PKT_Property[];
    public syncData(info: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO) {
        if (!this.playerInfo) this.playerInfo = info;
        else {

        }
    }
    public destroy() {

    }
    protected updateRooms(rooms: op_client.IEditModeRoom[]) {
        if (rooms) {
            if (!this.rooms) this.rooms = rooms;
            else {
                for (const temp of rooms) {
                    for (const room of this.rooms) {
                        if (room.roomId === temp.roomId) {
                            for (const key in temp) {
                                if (temp.hasOwnProperty(key))
                                    room[key] = temp[key];
                            }
                        }
                    }
                }
            }
        }
    }

    protected updateHandhelds(handheld: op_client.ICountablePackageItem[]) {

    }

    protected updateProperties(properties: op_pkt_def.PKT_Property[]) {

    }
}
