import { op_client } from "pixelpai_proto";
import { Element } from "../element/element";
import { DragonBonesDisplay } from "../display/dragonBones.display";
import { IElementManager } from "../element/element.manager";
import { ElementDisplay } from "../display/element.display";
import { IDisplayInfo } from "../display/display.info";

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

  constructor(protected mElementManager: IElementManager, parent: Phaser.GameObjects.Container) {
    super(mElementManager, parent);
    this.createDisplay();
  }

  public createDisplay(): ElementDisplay | undefined {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    let scene: Phaser.Scene = this.mElementManager.scene;
    if (scene) {
      this.mDisplay = new DragonBonesDisplay(scene);
      this.layer.add(this.mDisplay);
     
      return this.mDisplay;
    }
    return undefined;
  }

  private dragonBonesFrameComplete(e: Event) {
    // todo  state change
    //this.mElementManager.connection.send()
    //动作完成后发送协议给服务器告诉后端角色动作已经完成了，需要改变状态了
    //this.changeState(PlayerState.IDLE);
  }

  public load(display: IDisplayInfo) {
    super.load(display);
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

  private mCheckStateHandle(val: string): boolean {
    let dragonBonesDisplay: DragonBonesDisplay = this.mDisplay as DragonBonesDisplay;
    switch (val) {
      case PlayerState.IDLE:

        break;
      case PlayerState.WALK:

        break;
      case PlayerState.RUN:

        break;
      case PlayerState.ATTACK:

        break;
      case PlayerState.JUMP:
        break;
      case PlayerState.INJURED:
        break;
      case PlayerState.FAILED:
        break;
      case PlayerState.DANCE01:
        break;
      case PlayerState.DANCE02:
        break;
      case PlayerState.FISHING:
        break;
      case PlayerState.GREET01:
        break;
      case PlayerState.SIT:
        break;
      case PlayerState.LIE:
        break;
      case PlayerState.EMOTION01:
        break;
    }
    return true;
  }







  public disopse() {
    (this.mDisplay as DragonBonesDisplay).getDisplay().removeListener(dragonBones.EventObject.COMPLETE, this.dragonBonesFrameComplete, this);
    super.dispose();
  }

  set layer(layer: Phaser.GameObjects.Container) {
    this.mLayer = layer;
  }

  get layer(): Phaser.GameObjects.Container {
    return this.mLayer;
  }



}