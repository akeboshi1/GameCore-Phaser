import { PacketHandler } from "net-socket-packet";
import { WorldService } from "./world.service";

export class LoadingManager extends PacketHandler {
  private mCallBack: Function;
  constructor(private mWorld: WorldService) {
    super();
  }


  public start(data?: any) {
    if (data) {
      this.mCallBack = data.callback;
    }
    if (this.mWorld.game) {
      //todo load res
      //加载完之后调用返回函数
      this.stop();
    }
  }

  public stop() {
    if (this.mCallBack) {
      this.mCallBack();
    }
  }
}