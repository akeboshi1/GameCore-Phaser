// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容

// export interface IGameConfigure extends Phaser.Types.Core.GameConfig {
//   readonly auth_token: string;
//   readonly token_expire: string | null;
//   readonly token_fingerprint: string;
//   readonly server_addr: ServerAddress | undefined;
//   readonly game_id: string;
//   readonly virtual_world_id: string;
// }
import { version } from "./lib/version";
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
          //console.log(newVersion + "3");
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


    import(/* webpackChunkName: "game" */ "./src/game").then(game => {
      new game.Game();
    });
  }
}



window.onload = () => {
  new Launcher();
};

