// 加载器：
// 1. 在这里接受外部传入的参数并转换为World可以接受的参数
// 2. 做设备兼容
export class LauncherVersion {
  public static version: string;
}

// export interface IGameConfigure extends Phaser.Types.Core.GameConfig {
//   readonly auth_token: string;
//   readonly token_expire: string | null;
//   readonly token_fingerprint: string;
//   readonly server_addr: ServerAddress | undefined;
//   readonly game_id: string;
//   readonly virtual_world_id: string;
// }

export class Launcher {
  private _version;

  constructor() {
    let s = this;
    let version = this._version;
    this._version = version = document.getElementById("game_version");
    if (version) {
      console.log(version.content);
    }
    //todo window load 
    ///this.mWorld.game.scene.start("PlayScene");

    setInterval(() => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', "./version.json", true);
      xhr.addEventListener("load", function () {
        var manifest = JSON.parse(xhr.response);
        var version = manifest.version;
        if (s._version !== version) {
          const result = confirm("检测到新版本，是否刷新更新到最新版？");
          if (result) {
            window.location.reload();
          }
        }
      });
      xhr.send(null)
    }, 100000);

    import(/* webpackChunkName: "game" */ "./src/game").then(game => {
      new game.Game();
    });
  }
}

window.onload = () => {
  new Launcher();
};

