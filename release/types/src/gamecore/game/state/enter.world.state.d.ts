import { MainPeer } from "../main.peer";
import { BaseState } from "./base.state";
export declare class EnterWorldState extends BaseState {
    private mIsSyncPackage;
    private remoteIndex;
    constructor(main: MainPeer, key: string);
    run(): void;
    update(data?: any): void;
    next(): void;
    /**
     * 服务器下发 _OP_GATEWAY_RES_CLIENT_VIRTUAL_WORLD_INIT协议后，开始处理pi
     * @param packet
     * @returns
     */
    private onInitVirtualWorldPlayerInit;
    private initgameConfigUrls;
    private loadGameConfig;
    private decodeConfigs;
    private gameCreated;
    private onEnterSceneHandler;
    private onEnterScene;
    private loadSceneConfig;
    private getConfigUrl;
}
