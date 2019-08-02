// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容
import "phaser";
import "dragonBones";
import { ServerAddress } from "./src/net/address";
import { World } from "./src/game/world";
import { PlayScene } from "./src/scenes/play";

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
    this.mWorld = new World(this.config);
  }

  get config(): IGameConfigure {
    // TODO 在这里整合app和phaser的配置文件
    return {
      auth_token: "",
      token_expire: "",
      token_fingerprint: "",
      sever_addr: undefined,
      game_id: "",
      virtual_world_id: "",
      type: Phaser.AUTO,
      zoom: 1,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      parent: "game",
      scene: [PlayScene],
      url: "",
      disableContextMenu: false,
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
