// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容

export interface IGameConfigure extends Phaser.Types.Core.GameConfig {
  readonly auth_token: string;
  readonly token_expire: string | null;
  readonly token_fingerprint: string;
  readonly server_addr: ServerAddress | undefined;
  readonly game_id: string;
  readonly virtual_world_id: string;
}
import "phaser";
import "dragonBones";
import { version } from "./lib/version";
import { World } from "./src/game/world";
import { ServerAddress } from "./src/net/address";
export class Launcher {

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


    //todo window load 
    ///this.mWorld.game.scene.start("PlayScene");


    import(/* webpackChunkName: "game" */ "./src/game/world").then(game => {
      new World(this.config);
    });
  }

  get config(): IGameConfigure {
    // TODO 在这里整合app和phaser的配置文件
    return {
      auth_token: CONFIG.auth_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMmRmOTQ4OTUxYTRmNGY2NGMzYmEzMSIsImlhdCI6MTU2NjAyODU0MCwiZXhwIjoxNTY2NjMzMzQwfQ._pd4aKVZL6pTC3kl0xwoWV94RBcA2V7mf98C1IjY2bc",
      token_expire: CONFIG.token_expire || "1566633340",
      token_fingerprint: CONFIG.token_fingerprint || "27b63bf5c95d53b8bd6d95ffdfc7a1f599a18cbe",
      server_addr: CONFIG.server_addr || undefined,
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
      scale: {
        parent: 'game',
        mode: Phaser.Scale.RESIZE,
        width: "100 %",
        height: "100 %"
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

