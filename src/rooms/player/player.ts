import { op_client } from "pixelpai_proto";
import { Element } from "../element/element";
import { DragonBonesDisplay } from "../display/dragonBones.display";
import { IElementManager } from "../element/element.manager";
import { ElementDisplay } from "../display/element.display";
import { IDisplayInfo } from "../display/display.info";
import { Tweens } from "phaser";

export enum PlayerState {
  IDLE = "idle",
  WALK = "walk",
  RUN = "run",
  ATTACK = "attack",
  JUMP = "jump",
  INJURED = "injured",
  FAILED = "failed",
  DANCE01 = "dance01",
  DANCE02 = "dance02",
  FISHING = "fishing",
  GREET01 = "greet01",
  SIT = "sit",
  LIE = "lit",
  EMOTION01 = "emotion01"
}

export class Player extends Element {

  private mCurState: string;

  private mTw: Tweens.Tween;

  constructor(protected mElementManager: IElementManager) {
    super(mElementManager);
    //this.createDisplay();
  }

  // public createDisplay(): ElementDisplay | undefined {
  //   if (this.mDisplay) {
  //     this.mDisplay.destroy();
  //   }
  //   let scene: Phaser.Scene = this.mElementManager.scene;
  //   if (scene) {
  //     this.mDisplay = new DragonBonesDisplay(scene);
  //     return this.mDisplay;
  //   }
  //   return undefined;
  // }

  private dragonBonesFrameComplete(e: Event) {
    // todo  state change
    //this.mElementManager.connection.send()
    //动作完成后发送协议给服务器告诉后端角色动作已经完成了，需要改变状态了
    this.changeState(PlayerState.IDLE);
  }

  public load(display: IDisplayInfo, callBack?: Function) {
    super.load(display, callBack);
  }

  public setPosition(x: number, y: number, z?: number) {
    super.setPosition(x, y, z);
  }

  public changeState(val: string) {
    if (this.mCheckStateHandle(val)) {
      this.mCurState = val;
      (this.mDisplay as DragonBonesDisplay).play = val;
    }
  }

  public move(moveData: op_client.IMoveData) {
    if (this.mTw) {
      this.mTw.stop();
    }
    let time: number = moveData.timeSpan;
    this.mTw = this.mElementManager.scene.tweens.add({
      targets: this.mDisplay,
      props: {
        x: { value: moveData.destinationPoint3f.x, duration: time, ease: "Linear" },
        y: { value: moveData.destinationPoint3f.y, duration: time, ease: "Linear" },
      },
      onComplete: function (tween, targets, play) {
        console.log("complete moveF");
        //todo 通信服務端到達目的地
        play.setPosition(moveData.destinationPoint3f.x, moveData.destinationPoint3f.y, moveData.destinationPoint3f.z);
      },
      onCompleteParams: [this],
    });

  }

  private mCheckStateHandle(val: string): boolean {
    let dragonBonesDisplay: DragonBonesDisplay = this.mDisplay as DragonBonesDisplay;
    return true;
  }

  get x(): number {
    return this.mDisplay.x;
  }

  get y(): number {
    return this.mDisplay.y;
  }

  get z(): number {
    return this.mDisplay.z;
  }

  public disopse() {
    (this.mDisplay as DragonBonesDisplay).getDisplay().removeListener(dragonBones.EventObject.COMPLETE, this.dragonBonesFrameComplete, this);
    super.dispose();
  }
}