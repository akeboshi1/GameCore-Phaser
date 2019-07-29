// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容
import "phaser";
import {ServerAddress} from "./net/address";
import {World} from "./game/world";


export interface IGameConfigure extends Phaser.Types.Core.GameConfig {
    readonly auth_token: string;
    readonly token_expire: string;
    readonly token_fingerprint: string;
    readonly sever_addr: ServerAddress;
    readonly game_id: string;
    readonly virtual_world_id: string;
}

export class Launcher {
    private mWorld: World;

    constructor() {
        this.mWorld = new World(this.config)
    }

    private get config():IGameConfigure{
        // TODO 在这里整合app和phaser的配置文件
        return {
            audio: undefined,
            auth_token: "",
            autoFocus: false,
            backgroundColor: undefined,
            banner: undefined,
            callbacks: undefined,
            canvas: undefined,
            canvasStyle: "",
            context: undefined,
            disableContextMenu: false,
            dom: undefined,
            fps: undefined,
            game_id: "",
            images: undefined,
            input: undefined,
            loader: undefined,
            parent: undefined,
            physics: undefined,
            plugins: undefined,
            render: undefined,
            resolution: 0,
            scale: undefined,
            scene: undefined,
            seed: [],
            sever_addr: undefined,
            title: "",
            token_expire: "",
            token_fingerprint: "",
            transparent: false,
            type: 0,
            url: "",
            version: "",
            virtual_world_id: "",
            zoom: 0,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        }
    }

}
