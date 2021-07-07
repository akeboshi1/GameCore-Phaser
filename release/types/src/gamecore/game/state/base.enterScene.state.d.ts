import { Capsule } from "game-capsule";
import { PBpacket } from "net-socket-packet";
import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
import { op_client } from "pixelpai_proto";
export declare class BaseEnterSceneState extends BaseState {
    protected remoteIndex: number;
    constructor(main: MainPeer, key: string);
    run(): void;
    protected onEnterSceneHandler(packet: PBpacket): void;
    protected onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE): Promise<void>;
    protected loadSceneConfig(sceneID: string): Promise<any>;
    protected loadGameConfig(remotePath: any): Promise<Capsule>;
    protected decodeConfigs(req: any): Promise<Capsule>;
    protected getConfigUrl(sceneId: string): string;
}
