export enum PlatFormType {
    PC = "pc",
    APP = "app"
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
    ui_scale?: number;
    devicePixelRatio?: number;
    scale_ratio?: number;
    platform?: string;
    keyboardHeight: number;
    width: number;
    height: number;
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
    readonly baseWidth: number;
    readonly baseHeight: number;
    readonly connection?: any;
    readonly parent?: string;
}
