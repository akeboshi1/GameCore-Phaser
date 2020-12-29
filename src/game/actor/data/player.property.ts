import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
import { Logger } from "utils";
export class PlayerProperty {
    public playerInfo: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
    public nickname: string;
    public cid: string;
    public picaStar: number;
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
        } else {
            this.updateRooms(info.rooms);
            this.updateHandhelds(info.handheld);
            this.updateProperties(info.properties);
        }
        this.updateBaseProperties();
    }
    public hasProperty(id: string) {
        if (this.propertiesMap && this.propertiesMap.has(id)) return true;
        return false;
    }
    public getProperty(id: string) {
        if (this.hasProperty(id)) return this.propertiesMap.get(id);
        return null;
    }
    public destroy() {
        this.playerInfo = undefined;
        this.nickname = undefined;
        this.coin = undefined;
        this.diamond = undefined;
        this.level = undefined;
        this.energy = undefined;
        this.experience = undefined;
        this.workChance = undefined;
        this.rooms = undefined;
        this.handheld = undefined;
        this.command = undefined;
        if (this.rooms) {
            this.rooms.length = 0;
            this.rooms = undefined;
        }
        if (this.propertiesMap) {
            this.propertiesMap.clear();
        }
        if (this.properties) {
            this.properties.length = 0;
            this.properties = undefined;
        }
    }
    protected updateRooms(rooms: op_client.IEditModeRoom[]) {
        if (rooms) {
            if (!this.rooms) this.rooms = rooms;
            else {
                for (const temp of rooms) {
                    let isexit = false;
                    for (const room of this.rooms) {
                        if (room.roomId === temp.roomId) {
                            Object.assign(room, temp);
                            isexit = true;
                        }
                    }
                    if (!isexit) this.properties.push(temp);
                }
            }
        }
    }

    protected updateHandhelds(handheld: op_client.ICountablePackageItem) {
        if (handheld) {
            if (!this.handheld) this.handheld = handheld;
            else {
                Object.assign(this.handheld, handheld);
            }
        }
    }

    protected updateProperties(properties: op_pkt_def.IPKT_Property[]) {
        if (properties) {
            if (!this.rooms) this.properties = properties;
            else {
                for (const temp of properties) {
                    let isexit = false;
                    for (const proper of this.properties) {
                        if (proper.id === temp.id) {
                            Object.assign(proper, temp);
                            isexit = true;
                        }
                    }
                    if (!isexit) this.properties.push(temp);
                }
            }
        }
    }

    protected updateBaseProperties() {
        this.cid = this.playerInfo.cid;
        this.rooms = this.playerInfo.rooms;
        this.properties = this.playerInfo.properties;
        this.handheld = this.playerInfo.handheld;
        this.command = this.playerInfo.command;
        this.nickname = this.playerInfo.nickname;
        this.picaStar = this.playerInfo.picaStar;
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
