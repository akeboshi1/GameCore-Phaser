// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容
import "phaser";
import "dragonBones";
import {version} from "./lib/version";
import {World} from "./src/game/world";
import {ServerAddress} from "./src/net/address";

export interface IGameConfigure extends Phaser.Types.Core.GameConfig {
    readonly auth_token: string;
    readonly token_expire: string | null;
    readonly token_fingerprint: string;
    readonly server_addr: ServerAddress | undefined;
    readonly game_id: string;
    readonly virtual_world_id: string;
}

export class Launcher {
    get config(): IGameConfigure {
        // TODO 在这里整合app和phaser的配置文件
        // TODO 没有登陆处理
        return {
            auth_token: CONFIG.auth_token,
            token_expire: CONFIG.token_expire,
            token_fingerprint: CONFIG.token_fingerprint,
            server_addr: undefined, // 不指定会使用CONFIG.gateway,请去 ./config/目录下修改配置文件
            game_id: CONFIG.game_id,
            virtual_world_id: CONFIG.virtual_world_id,
            type: Phaser.AUTO,
            zoom: 1,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            parent: "game",
            scene: [],
            url: "",
            disableContextMenu: true,
            transparent: false,
            backgroundColor: 0x0,
            resolution: 1,
            version: "",
            seed: [],
            plugins: {
                scene: [
                    {
                        key: "DragonBones",
                        plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                        mapping: "dragonbone",
                    }
                ]
            },
            render: {
                pixelArt: true,
                roundPixels: true
            }
        };
    }

    public static start(): Launcher {
        return new this();
    }

    readonly minWidth = 1366;
    readonly minHeight = 760;
    readonly maxWidth = 1920;
    readonly maxHeight = 1080;
    private world: World;

    constructor() {
        setInterval(() => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "./package.json", true);
            xhr.addEventListener("load", () => {
                const manifest = JSON.parse(xhr.response);
                const newVersion = manifest.version;
                if (version !== newVersion) {
                    const result = confirm("检测到新版本，是否刷新更新到最新版？");
                    if (result) {
                        window.location.reload();
                    }
                }
            });
            xhr.send(null);
        }, 7200000);

        import(/* webpackChunkName: "game" */ "./src/game/world").then((game) => {
            this.world = new World(this.config);
        });
    }

    public onResize(width: number, height: number) {
        const scale = Math.min(width / this.minWidth, height / this.minHeight);
        const newWidth = Math.min(width / scale, this.maxWidth);
        const newHeight = Math.min(height / scale, this.maxHeight);

        if (this.world) {
            this.world.resize(newWidth, newHeight);
        }
    }
}
