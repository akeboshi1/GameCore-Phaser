import { MainPeer } from "../main.peer";
import { PBpacket } from "net-socket-packet";
import { BaseEnterSceneState } from "./base.enterScene.state";
export declare class EnterWorldState extends BaseEnterSceneState {
    protected isSyncPackage: boolean;
    protected remoteIndex: number;
    constructor(main: MainPeer, key: string);
    run(): void;
    update(data?: any): void;
    next(): void;
    /**
     * 服务器下发 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT协议后，开始处理pi
     * @param packet
     * @returns
     */
    protected onInitVirtualWorldPlayerInit(packet: PBpacket): Promise<void>;
    protected initgameConfigUrls(urls: string[]): void;
    protected gameCreated(): void;
}
