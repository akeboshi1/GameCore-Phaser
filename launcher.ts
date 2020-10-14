// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容

import version from "./version";
// import { ServerAddress } from "./src/net/address";
// import { ConnectionService } from "./src/net/connection.service";
// import { Capsule, PaletteNode, MossNode } from "game-capsule";
// import { EditorLauncher, EditorCanvasType } from "./src/editor/editor.launcher";
// import { ElementEditorEmitType, ElementEditorBrushType } from "./src/editor/canvas/element/element.editor.canvas";

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
    private game: GameMain;
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
        closeGame: null,
        connectFail: null,
        platform: "pc",
    };

    constructor(config?: ILauncherConfig) {
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

        import(/* webpackChunkName: "game" */ "./src/render/rendrer").then((game) => {
            this.game = new game.Render(this.config, this.mCompleteFunc);
            if (config.isEditor) {
                this.game.createGame();
            }
            this.disableClick();
        });
    }

    public pauseGame() {
        if (this.game) this.game.onBlur();
    }

    public resumeGame() {
        if (this.game) this.game.onFocus();
    }

    public keyBoardHeight(height: number) {
        if (this.game) this.game.setKeyBoardHeight(height);
    }

    public enableClick() {
        if (this.game) this.game.enableClick();
    }

    public disableClick() {
        if (this.game) {
            this.game.disableClick();
        } else {
        }
    }

    public startFullscreen() {
        if (!this.game) {
            return;
        }
        this.game.startFullscreen();
    }

    public stopFullscreen() {
        if (!this.game) {
            return;
        }
        this.game.stopFullscreen();
    }

    public setGameConfig(config) {
        if (!this.game) return;
        this.game.setGameConfig(config);
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
        if (this.world) return this.world.destroy();
        return null;
    }
}

export * from "./src/game/core/editor";
