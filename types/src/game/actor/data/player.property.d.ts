import { op_client, op_pkt_def, op_def } from "pixelpai_proto";
export declare class PlayerProperty {
    playerInfo: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO;
    nickname: string;
    cid: string;
    picaStar: op_pkt_def.IPKT_Property;
    survey: op_pkt_def.IPKT_Property;
    coin: op_pkt_def.IPKT_Property;
    diamond: op_pkt_def.IPKT_Property;
    level: op_pkt_def.IPKT_Property;
    energy: op_pkt_def.IPKT_Property;
    experience: op_pkt_def.IPKT_Property;
    workChance: op_pkt_def.IPKT_Property;
    rooms: op_client.IEditModeRoom[];
    handheld: op_client.ICountablePackageItem;
    command: op_def.OpCommand;
    propertiesMap: Map<string, op_pkt_def.IPKT_Property>;
    properties: op_pkt_def.IPKT_Property[];
    syncData(info: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO): void;
    hasProperty(id: string): boolean;
    getProperty(id: string): op_pkt_def.IPKT_Property;
    destroy(): void;
    protected updateRooms(rooms: op_client.IEditModeRoom[]): void;
    protected updateHandhelds(handheld: op_client.ICountablePackageItem): void;
    protected updateProperties(properties: op_pkt_def.IPKT_Property[]): void;
    protected updateBaseValue(info: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_PKT_PLAYER_INFO): void;
    protected updateBaseProperties(): void;
}
