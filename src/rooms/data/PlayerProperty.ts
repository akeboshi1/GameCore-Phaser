import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { Logger } from "../../utils/log";
export class PlayerProperty {
    public playerInfo: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
    public coin: op_pkt_def.IPKT_Property;
    public diamond: op_pkt_def.IPKT_Property;
    public level: op_pkt_def.IPKT_Property;
    public energy: op_pkt_def.IPKT_Property;
    public experience: op_pkt_def.IPKT_Property;
    public workChance: op_pkt_def.IPKT_Property;
    public rooms: op_client.IEditModeRoom[];
    public handheld: op_client.ICountablePackageItem;
    public command: op_def.OpCommand;
    public propertiesMap: Map<string, op_pkt_def.IPKT_Property>;
    public properties: op_pkt_def.IPKT_Property[];
    public syncData(info: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO) {
        if (!this.playerInfo) {
            this.playerInfo = info;
            this.updateBaseProperties();
        } else {
            this.updateRooms(info.rooms);
            this.updateHandhelds(info.handheld);
            this.updateProperties(info.properties);
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

    protected updateHandhelds(handheld: op_client.ICountablePackageItem) {
        if (handheld) {
            if (!this.handheld) this.handheld = handheld;
            else {
                for (const key in handheld) {
                    if (handheld.hasOwnProperty(key))
                        this.handheld[key] = handheld[key];
                }
            }
        }
    }

    protected updateProperties(properties: op_pkt_def.IPKT_Property[]) {
        if (properties) {
            if (!this.rooms) this.properties = properties;
            else {
                for (const temp of properties) {
                    for (const proper of this.properties) {
                        if (proper.id === temp.id) {
                            for (const key in temp) {
                                if (temp.hasOwnProperty(key))
                                    proper[key] = temp[key];
                            }
                        }
                    }
                }
            }
        }
    }

    protected updateBaseProperties() {
        this.rooms = this.playerInfo.rooms;
        this.properties = this.playerInfo.properties;
        this.handheld = this.playerInfo.handheld;
        this.command = this.playerInfo.command;
        this.propertiesMap = new Map<string, op_pkt_def.IPKT_Property>();
        for (const proper of this.properties) {
            if (!proper.hasOwnProperty("id")) {
                Logger.getInstance().error(proper.key + "  缺少ID");
                continue;
            }
            this.propertiesMap.set(proper.id, proper);
            if (proper.id === "IV0000001") {
                this.coin = proper;
            } else if (proper.id === "IV0000002") {
                this.diamond = proper;
            } else if (proper.id === "IV1000001") {
                this.level = proper;
            } else if (proper.id === "IV0000004") {
                this.energy = proper;
            } else if (proper.id === "IV0000018") {
                this.workChance = proper;
            } else if (proper.id === "IV0000005") {
                this.experience = proper;
            }
        }
    }
}
