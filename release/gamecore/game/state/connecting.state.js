var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { Logger } from "structure";
import { Clock, HttpClock } from "../loop";
import { BaseState } from "./base.state";
export class ConnectingState extends BaseState {
  constructor(main, key) {
    super(main, key);
  }
  run() {
    super.run();
    const config = this.mMain.config;
    const gateway = config.server_addr;
    if (!gateway || !gateway.host || !gateway.port) {
      this.mMain.render.showAlert("\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u6216\u7A0D\u540E\u518D\u8BD5", true, false).then(() => __async(this, null, function* () {
        yield this.mMain.render.clearAccount();
        this.mGame.login();
      }));
      return;
    }
    if (gateway) {
      const addr = { host: gateway.host, port: gateway.port, secure: gateway.secure };
      this.mGame.connection.startConnect(addr);
    }
  }
  update(data) {
    this.mGame.renderPeer.onConnected(data);
    this.mGame.isAuto = data || false;
    if (!this.mGame.clock)
      this.mGame.clock = new Clock(this.mGame.connection, this.mGame.peer, this.mGame);
    if (!this.mGame.httpClock)
      this.mGame.httpClock = new HttpClock(this.mGame);
    Logger.getInstance().info(`enterVirtualWorld`);
    this.mGame.connection.connect = true;
    this.next();
  }
  next() {
    this.mGame.loginEnterWorld();
  }
}
