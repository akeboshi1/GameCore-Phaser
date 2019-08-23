import { PacketHandler } from "net-socket-packet";
import { WorldService } from "./world.service";
import { SceneType } from "../const/scene.type";

export class LoadingManager extends PacketHandler {
  private mCallBack: Function;
  constructor(private mWorld: WorldService) {
    super();
  }


  public start(callback?: Function) {
    this.mCallBack = callback;
    if (this.mWorld.game) {
      //todo load res
      //加载完之后调用返回函数
      this.stop();
    }
  }

  public stop() {
    this.mCallBack();
  }
}