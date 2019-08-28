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
    readonly minWidth = 0;
    readonly minHeight = 0;
    readonly maxWidth = 0;
    readonly maxHeight = 0;

    private world: World;

    constructor() {
        let s = this;

        setInterval(() => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', "./package.json", true);
            xhr.addEventListener("load", function () {
                let manifest = JSON.parse(xhr.response);
                let newVersion = manifest.version;
                // console.log(version + ":1," + newVersion);
                if (version !== newVersion) {
                    //Yconsole.log(newVersion + "3");
                    const result = confirm("检测到新版本，是否刷新更新到最新版？");
                    if (result) {
                        window.location.reload();
                    }
                }
            });
            xhr.send(null);
        }, 7200000);


        // todo window load
        ///this.mWorld.game.scene.start("PlayScene");
        window.addEventListener("resize", () => {
            const w = window.innerWidth;
            const h = window.innerHeight;

            let width = this.minWidth;
            let height = this.minHeight;
            let maxWidth = this.maxWidth;
            let maxHeight = this.maxHeight;

            let scale = Math.min(w / width, h / height);
            let newWidth = Math.min(w / scale, maxWidth);
            let newHeight = Math.min(h / scale, maxHeight);

            if (this.world) {
                this.world.resize(w, h);
            }
        });


        import(/* webpackChunkName: "game" */ "./src/game/world").then(game => {
            this.world = new World(this.config);
        });
    }

    get config(): IGameConfigure {
        // TODO 在这里整合app和phaser的配置文件
        return {
            auth_token: CONFIG.auth_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMmRmOTQ4OTUxYTRmNGY2NGMzYmEzMSIsImlhdCI6MTU2NjYzNzY1NiwiZXhwIjoxNTY3MjQyNDU2fQ.iAocnlNRL-E55RCxVsIdA4Uwv_AZcTQrvndetOQpZHg",
            token_expire: CONFIG.token_expire || "1567242456",
            token_fingerprint: CONFIG.token_fingerprint || "332244e001e10be33205fc8b51a7ce76fb80323b",
            server_addr: undefined, // 不指定会使用CONFIG.gateway,请去 ./config/目录下修改配置文件
            game_id: CONFIG.game_id || "5d2691baf2f97440d7bb43c3",
            virtual_world_id: CONFIG.virtual_world_id || "0",
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
                        mapping: "dragonbone"
                    }
                ]
            },
            render: {
                pixelArt: true,
                roundPixels: true
            }
        };
    }
}

window.onload = () => {
    new Launcher();
};

