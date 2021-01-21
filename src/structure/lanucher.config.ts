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
    osd?: string;
    runtime: string;
    readonly screenWidth: number;
    readonly screenHeight: number;
    readonly baseWidth: number;
    readonly baseHeight: number;
    readonly game_created?: Function;
    readonly connection?: any;
    readonly closeGame: Function;
    readonly connectFail?: Function;
    readonly parent?: string;
}
