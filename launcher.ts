// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容
// import { World } from "./src/game/world";

// export interface IGameConfigure extends Phaser.Types.Core.GameConfig {
//   readonly auth_token: string;
//   readonly token_expire: string | null;
//   readonly token_fingerprint: string;
//   readonly server_addr: ServerAddress | undefined;
//   readonly game_id: string;
//   readonly virtual_world_id: string;
// }

export class Launcher {

  constructor() {
    import(/* webpackChunkName: "game" */ "./src/game").then(game => {
      new game.Game();
    });
  }
}

window.onload = () => {
  new Launcher();
};
