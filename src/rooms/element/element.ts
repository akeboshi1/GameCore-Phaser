import { IElementManager } from "./element.manager";
import { IFramesModel, FramesModel } from "../display/frames.model";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { FramesDisplay } from "../display/frames.display";
import { IRoomService } from "../room";
import { Block } from "../block/block";
import { ElementDisplay } from "../display/element.display";
import { IDragonbonesModel, DragonbonesModel } from "../display/dragonbones.model";
import { op_client } from "pixelpai_proto";
import { Tweens } from "phaser";
import { Console } from "../../utils/log";

export interface IElement {
  readonly id: number;

  block: Block;
  inCamera: boolean;

  setPosition(x: number, y: number, z?: number): void;

  addDisplay(): void;

  removeDisplay(): void;
}

export class Element implements IElement {
  protected mX: number;
  protected mY: number;
  protected mZ: number;
  protected mDisplayInfo: IFramesModel | IDragonbonesModel;
  protected mLayer: Phaser.GameObjects.Container;
  protected mDisplay: ElementDisplay | undefined;
  protected mBlock: Block;
  protected mInCamera: boolean = false;
  protected mTw: Tweens.Tween;

  constructor(data: op_client.IElement | op_client.IActor, protected mElementManager: IElementManager) {
    // if (data) {
    // TOOD displayInfo 在内部创建
    // if (data.hasOwnProperty("animations")) {
    //   this.mDisplayInfo = new FramesModel();
    // } else {
    //   this.mDisplayInfo = new DragonbonesModel();
    // }
    // }
  }

  public load(displayInfo: IFramesModel | IDragonbonesModel) {
    this.mDisplayInfo = displayInfo;
    // this.createDisplay();
    this.setPosition(displayInfo.x, displayInfo.y);
  }

  public changeState(val: string) {}

  public addDisplay() {
    if (!this.mDisplay) {
      if (!this.createDisplay()) {
        return;
      }
    }
    const room = this.roomService;
    if (!room) {
      Console.error("roomService is undefined");
      return;
    }
    room.addToSurface(this.mDisplay);
  }

  public removeDisplay() {
    if (!this.mDisplay) {
      return;
    }
    if (this.mDisplay) {
      this.mDisplay.removeFromParent();
    }
  }

  public getDisplay(): ElementDisplay {
    return this.mDisplay;
  }

  public move(moveData: op_client.IMoveData) {
    if (!this.mElementManager) {
        throw new Error(`Player::move - Empty element-manager.`);
    }
    if (!this.mDisplay) {
      throw new Error("display is undefined");
    }

    const baseLoc = this.mDisplay.baseLoc;
    const time: number = moveData.timeSpan
        , toX: number = moveData.destinationPoint3f.x + baseLoc.x
        , toY: number = moveData.destinationPoint3f.y + baseLoc.y;

    Console.log(`${time}: ${toX}, ${toY}`);
    const tw = this.mElementManager.scene.tweens.add({
        targets: this.mDisplay,
        duration: time,
        ease: "Linear",
        props: {
            x: {value: toX},
            y: {value: toY},
        },
        onComplete: (tween, targets, play) => {
            Console.log("complete moveF");
            // todo 通信服務端到達目的地
            play.setPosition(moveData.destinationPoint3f.x, moveData.destinationPoint3f.y, 0);
        },
        onUpdate: (tween, targets, play) => {
            this.setDepth();
            this.setBlock();
        },
        onCompleteParams: [this],
    });

    if (this.mTw) this.mTw.stop();
    this.mTw = tw;
  }

  public setPosition(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    this.mX = x;
    this.mY = y;
    this.mZ = z;
    if (this.mDisplay) {
      this.mDisplay.GameObject.setPosition(this.mX, this.mY, z);
      this.setDepth();
    }
    this.setBlock();
  }

  public dispose() {
    if (this.mDisplay) {
      this.mDisplay.destroy();
      this.mDisplay = null;
    }
  }

  protected setBlock() {
    const room = this.mElementManager.roomService;
    if (!room) {
      return;
    }
    const blocks = room.blocks;
    if (!blocks) {
      return;
    }
    for (const block of blocks) {
      const rect = block.rectangle;
      if (rect.contains(this.mX, this.mY)) {
        block.add(this);
        return;
      }
    }
  }

  protected createDisplay(): ElementDisplay {
    if (!this.mDisplayInfo) return undefined;
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    const scene = this.mElementManager.scene;
    if (scene) {
      if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
        this.mDisplay = new DragonbonesDisplay(scene);
      } else {
        this.mDisplay = new FramesDisplay(scene);
      }
      this.mDisplay.GameObject.once("initialized", this.onDisplayReady, this);
      this.mDisplay.load(this.mDisplayInfo);
    }
    return this.mDisplay;
  }

  protected setDepth() {
    if (this.mDisplay) {
      this.mDisplay.GameObject.setDepth(this.mDisplay.x + this.mDisplay.y);
    }
  }

  protected onDisplayReady() {
    if (this.mDisplay) {
      const baseLoc = this.mDisplay.baseLoc;
      this.setPosition(this.mDisplayInfo.x + baseLoc.x, this.mDisplayInfo.y + baseLoc.y);
    }
  }

  get roomService(): IRoomService {
    if (!this.mElementManager) {
      Console.error("element manager is undefined");
      return;
    }
    return this.mElementManager.roomService;
  }

  set inCamera(val: boolean) {
    if (this.mInCamera !== val) {
      this.mInCamera = val;
      if (this.mInCamera) {
        this.addDisplay();
      } else {
        this.removeDisplay();
      }
    }
  }

  get inCamera(): boolean {
    return this.mInCamera;
  }

  set block(val: Block) {
    this.mBlock = val;
  }

  get block(): Block {
    return this.mBlock;
  }

  get id(): number {
    return this.mDisplayInfo.id || 0;
  }
}
