// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容
import { ILauncherConfig, PlatFormType } from "structure";
import { Logger } from "utils";
import version from "./version";
export class Launcher {
    get config(): ILauncherConfig {
        return this.mConfig;
    }

    public static start(config?: ILauncherConfig): Launcher {
        return new this(config);
    }

    public static DeserializeNode(buffer) {
        // const capsule = new Capsule();
        // capsule.deserialize(buffer);
        // return capsule;
    }

    public static startElementEditor(config) {
        // const canvas = EditorLauncher.CreateCanvas(EditorCanvasType.Element, config);
        // let loadCount = 0;
        // canvas.on(ElementEditorEmitType.Resource_Loaded, (success: boolean, msg: string) => {
        //     Logger.getInstance().log("loadCount", loadCount);
        //     if (success && loadCount === 0) {
        //         loadCount++;
        //         // canvas.deserializeDisplay().then((val) => {
        //         //     Logger.getInstance().log("deserializeDisplay", val);
        //         //     canvas.generateSpriteSheet(val).then((spriteSheet) => {
        //         //         Logger.getInstance().log("generateSpriteSheet", spriteSheet);
        //         //     });
        //         // });
        //         canvas.reloadDisplayNode();
        //     }
        // });
    }

    readonly minWidth = 1280;
    readonly minHeight = 720;
    readonly maxWidth = 1920;
    readonly maxHeight = 1080;
    readonly keyboardHeight = 256;
    private world: any;
    private intervalId: any;
    private mReload: Function;
    private mCompleteFunc: Function;
    private mConfig: ILauncherConfig = {
        api_root: undefined,
        auth_token: undefined,
        token_expire: undefined,
        token_fingerprint: undefined,
        user_id: undefined,
        server_addr: undefined, // 不指定会使用CONFIG.gateway,请去 ./config/目录下修改配置文件
        game_id: undefined,
        virtual_world_id: undefined,
        // 16:9 = 3840×2160 2560X1440 1920×1080 1600×900 1366×768 1280×720 1024×576 960×540 854×480 720×405
        width: this.minWidth,
        height: this.minHeight,
        keyboardHeight: this.keyboardHeight,
        screenWidth: this.minWidth,
        screenHeight: this.minHeight,
        baseWidth: this.maxWidth,
        baseHeight: this.maxHeight,
        ui_scale: undefined,
        hasConnectFail: false,
        hasCloseGame: false,
        hasGameCreated: false,
        hasGameLoaded: false,
        hasReload: false,
        closeGame: null,
        connectFail: null,
        gameLoaded: null,
        reload: null,
        game_created: null,
        platform: PlatFormType.NOPC,
    };

    constructor(config?: ILauncherConfig) {
        if (config.osd) {
            config.osd = new URL("/", decodeURIComponent(config.osd)).toString();
        }
        if (config.api_root) {
            config.api_root = new URL("/", decodeURIComponent(config.api_root)).toString();
        }
        if (config) {
            Object.assign(this.mConfig, config);
        }

        this.intervalId = setInterval(() => {
            // const xhr = new XMLHttpRequest(); // TODO
            // xhr.open("GET", "./package.json", true);
            // xhr.addEventListener("load", () => {
            // const manifest = JSON.parse(xhr.response);
            const newVersion = version;
            if (version !== newVersion) {
                const result = confirm("检测到新版本，是否刷新更新到最新版？");
                if (result && this.mReload) {
                    this.mReload();
                }
            }
            // });
            // xhr.send(null);
        }, 4 * 60 * 60 * 1000 /* ms */);
        // todo 通过外部传入路径可加载不同模块游戏
        import(/* webpackChunkName: "game" */ "./src/pica/render/pica.render").then((game) => {
            if (!game) {
                // tslint:disable-next-line:no-console
                console.log("no game error");
                return;
            }
            this.world = new game.Render(this.config, this.mCompleteFunc);
            this.disableClick();
        }).catch((error) => {
            // tslint:disable-next-line:no-console
            console.log("import game error", error);
        });
    }

    public pauseGame() {
        if (this.world) this.world.onBlur();
    }

    public resumeGame() {
        if (this.world) this.world.onFocus();
    }

    public keyboardDidShow(height: number) {
        if (this.world) this.world.keyboardDidShow(height);
    }

    public keyboardDidHide(height: number) {
        if (this.world) this.world.keyboardDidHide();
    }

    public enableClick() {
        if (this.world) this.world.enableClick();
    }

    public disableClick() {
        if (this.world) {
            this.world.disableClick();
        } else {
        }
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

    public setGameConfig(config) {
        if (!this.world) return;
        this.world.setGameConfig(config);
    }

    public updatePalette(palette) {
        if (!this.world) return;
        this.world.updatePalette(palette);
    }

    public restart(config?: ILauncherConfig, callBack?: Function) {
        if (this.world) this.world.restart(config, callBack);
    }

    public updateMoss(moss) {
        if (!this.world) return;
        this.world.updateMoss(moss);
    }

    public registerReload(func: Function) {
        this.mReload = func;
    }

    public registerComplete(func: Function) {
        this.mCompleteFunc = func;
    }

    public onResize(width: number, height: number, ui_scale?: number) {
        if (!this.world) return;
        if (ui_scale) this.mConfig.ui_scale = ui_scale;
        this.world.resize(width, height);
        // if (width < height) {
        //     this.world.resize(this.mConfig.screenHeight, this.mConfig.screenWidth);
        // } else {
        //     this.world.resize(this.mConfig.screenWidth, this.mConfig.screenHeight);
        // }
    }

    public onOrientationChange(orientation: number, width: number, height: number) {
        if (!this.world) return;
        this.world.onOrientationChange(orientation, width, height);
    }

    public destroy(): Promise<void> {
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.world) {
            this.world.destroy();
            this.world = null;
        }
        return null;
    }
}
