export enum PlatFormType {
    PC = "pc",
    APP = "app",
    NOPC = "nopc"
}

export interface ILauncherConfig {
    api_root: string;
    auth_token: string;
    token_expire: string | null;
    token_fingerprint: string;
    server_addr: any | undefined;
    user_id: string;
    game_id: string;
    virtual_world_id: string;
    world_id: string;
    ui_scale?: number;
    devicePixelRatio?: number;
    scale_ratio?: number;
    platform?: string;
    keyboardHeight: number;
    width: number;
    height: number;
    baseWidth: number;
    baseHeight: number;
    renderPeerKey: string;
    version: string;
    // requireContext: any;
    locationhref?: string;
    hasConnectFail?: boolean;
    hasCloseGame?: boolean;
    hasGameCreated?: boolean;
    hasGameLoaded?: boolean;
    hasReload?: boolean;
    osd?: string;
    connectFail?: Function;
    closeGame: Function;
    game_created?: Function;
    gameLoaded?: Function;
    reload?: Function;
    readonly screenWidth: number;
    readonly screenHeight: number;
    readonly connection?: any;
    readonly parent?: string;
    readonly config_root?: string;
}
