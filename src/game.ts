import "phaser";
import "dragonBones";
import { PlayScene } from "./scenes/play";
import { ServerAddress } from "./net/address";
import { World } from "./game/world";
import { LoadingScene } from "./scenes/loading";

export interface IGameConfigure extends Phaser.Types.Core.GameConfig {
  readonly auth_token: string;
  readonly token_expire: string | null;
  readonly token_fingerprint: string;
  readonly server_addr: ServerAddress | undefined;
  readonly game_id: string;
  readonly virtual_world_id: string;
}

export class Game {
  private mWorld: World;
  constructor() {
    this.mWorld = new World(this.config);
  }

  get config(): IGameConfigure {
    // TODO 在这里整合app和phaser的配置文件
    return {
      auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMmRmOTQ4OTUxYTRmNGY2NGMzYmEzMSIsImlhdCI6MTU2NjAyODU0MCwiZXhwIjoxNTY2NjMzMzQwfQ._pd4aKVZL6pTC3kl0xwoWV94RBcA2V7mf98C1IjY2bc",
      token_expire: "1566633340",
      token_fingerprint: "27b63bf5c95d53b8bd6d95ffdfc7a1f599a18cbe",
      server_addr: undefined,
      game_id: "5d18bdf8052e8c2a4622e079",
      virtual_world_id: "0",
      type: Phaser.AUTO,
      zoom: 1,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      parent: "game",
      scene: [],
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