import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
import { PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Capsule } from "game-capsule";
export declare class EnterWorldState extends BaseState {
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
    protected loadGameConfig(remotePath: any): Promise<Capsule>;
    protected decodeConfigs(req: any): Promise<Capsule>;
    protected gameCreated(): void;
    protected onEnterSceneHandler(packet: PBpacket): void;
    protected onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE): Promise<void>;
    protected loadSceneConfig(sceneID: string): Promise<any>;
    protected getConfigUrl(sceneId: string): string;
}
