import { IElementManager } from "./element.manager";
import { IFramesModel, FramesModel } from "../display/frames.model";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { FramesDisplay } from "../display/frames.display";
import { IRoomService } from "../room";
import { Block } from "../block/block";
import { ElementDisplay } from "../display/element.display";
import { IDragonbonesModel, DragonbonesModel } from "../display/dragonbones.model";
import { op_client } from "pixelpai_proto";

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
  protected mBaseLoc: Phaser.Geom.Point;
  protected mDisplayInfo: IFramesModel | IDragonbonesModel;
  protected mLayer: Phaser.GameObjects.Container;
  protected mDisplay: ElementDisplay | undefined;
  protected mBlock: Block;
  protected mInCamera: boolean = false;

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
      console.error("roomService is undefined");
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

  public setPosition(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    this.mX = x;
    this.mY = y;
    this.mZ = z;
    if (this.mDisplay) {
      this.mDisplay.GameObject.setPosition(x, y, z);
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
      this.mDisplay.load(this.mDisplayInfo);
      this.setPosition(this.mDisplayInfo.x, this.mDisplayInfo.y);
    }
    return this.mDisplay;
  }

  get roomService(): IRoomService {
    if (!this.mElementManager) {
      console.error("element manager is undefined");
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
