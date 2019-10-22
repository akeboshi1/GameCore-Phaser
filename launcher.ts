// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容

import { version } from "./version";
import { ServerAddress } from "./src/net/address";

export interface ILauncherConfig {
    auth_token: string;
    token_expire: string | null;
    token_fingerprint: string;
    server_addr: ServerAddress | undefined;
    game_id: string;
    virtual_world_id: string;
    ui_scale?: number;
    readonly width: number | string;
    readonly height: number | string;
    readonly game_created?: Function;
}

export interface GameMain {
    resize(newWidth, newHeight);
    scaleChange(scale: number);

    startFullscreen(): void;
    stopFullscreen(): void;

    destroy(): void;
}

export class Launcher {
    get config(): ILauncherConfig {
        return this.mConfig;
    }

    public static start(config?: ILauncherConfig): Launcher {
        return new this(config);
    }

    readonly minWidth = 1366;
    readonly minHeight = 760;
    readonly maxWidth = 1920;
    readonly maxHeight = 1080;
    private world: GameMain;
    private intervalId: any;
    private mReload: Function;
    private mCompleteFunc: Function;
    private mConfig: ILauncherConfig = {
        auth_token: CONFIG.auth_token,
        token_expire: CONFIG.token_expire,
        token_fingerprint: CONFIG.token_fingerprint,
        server_addr: undefined, // 不指定会使用CONFIG.gateway,请去 ./config/目录下修改配置文件
        game_id: CONFIG.game_id,
        virtual_world_id: CONFIG.virtual_world_id,
        // 16:9 = 3840×2160 2560X1440 1920×1080 1600×900 1366×768 1280×720 1024×576 960×540 854×480 720×405
        width: 1280,
        height: 720,
        ui_scale: 1
    };

    constructor(config?: ILauncherConfig) {
        if (config) {
            Object.assign(this.mConfig, config);
        }
        this.intervalId = setInterval(() => {
            const xhr = new XMLHttpRequest(); // TODO
            xhr.open("GET", "./package.json", true);
            xhr.addEventListener("load", () => {
                const manifest = JSON.parse(xhr.response);
                const newVersion = manifest.version;
                if (version !== newVersion) {
                    const result = confirm("检测到新版本，是否刷新更新到最新版？");
                    if (result && this.mReload) {
                        this.mReload();
                    }
                }
            });
            xhr.send(null);
        }, 4 * 60 * 60 * 1000 /* ms */);

        import(/* webpackChunkName: "game" */ "./src/game/world")
            .then((game) => {
                this.world = new game.World(this.config, this.mCompleteFunc);
            });
    }

    public startFullscreen() {
        if (!this.world) {
            return;
        }
        this.world.startFullscreen();
    }

    public stopFullscreen() {
        if (!this.world) {
            return;
        }
        this.world.stopFullscreen();
    }

    public registerReload(func: Function) {
        this.mReload = func;
    }

    public registerComplete(func: Function) {
        this.mCompleteFunc = func;
    }

    public onResize(width: number, height: number, ui_scale?: number) {
        if (!this.world)
            return;
        if (ui_scale) this.mConfig.ui_scale = ui_scale;
        this.world.resize(width, height);
    }

    public destroy(): void {
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.world) this.world.destroy();
    }
}
