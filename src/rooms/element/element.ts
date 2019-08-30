import { IElementManager } from "./element.manager";
import { IDisplayInfo } from "../display/display.info";
import { ElementDisplay } from "../display/element.display";
import { DragonBonesDisplay } from "../display/dragonBones.display";
import { FramesDisplay } from "../display/frames.display";
import { IRoomService } from "../room";
import { Block } from "../block/block";
export interface IElement {
  block: Block;
  setPosition(x: number, y: number, z?: number): void;
  addDisplay(): void;
  removeDisplay(): void;
}

export class Element implements IElement {
  protected mX: number;
  protected mY: number;
  protected mZ: number;
  protected mBaseLoc: Phaser.Geom.Point;
  protected mDisplayInfo: IDisplayInfo;
  protected mLayer: Phaser.GameObjects.Container;
  protected mDisplay: ElementDisplay | undefined;
  protected mBlock: Block;
  constructor(protected mElementManager: IElementManager) { }

  public load(displayInfo: IDisplayInfo, callBack?: () => void) {
    this.mDisplayInfo = displayInfo;
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    const scene = this.mElementManager.scene;
    if (scene) {
      if (displayInfo.avatar) {
        this.mDisplay = new DragonBonesDisplay(scene);
      } else if (displayInfo.animations) {
        this.mDisplay = new FramesDisplay(scene);
      }
      this.mDisplay.load(displayInfo);
      this.setPosition(displayInfo.x, displayInfo.y);
    }
    if (callBack) callBack();
  }

  public changeState(val: string) {

  }

  public addDisplay() {
    if (!this.mDisplay) {
      // TODO 没有先去创建
      console.error("display is undefined");
      return;
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
      console.error("display is undefined");
      return;
    }
    if (this.mDisplay.parentContainer) {
      this.mDisplay.parentContainer.remove(this.mDisplay);
    }
  }

  public getDisplay(): ElementDisplay {
    return this.mDisplay;
  }

  public setPosition(x: number, y: number, z?: number) {
    if (!this.mDisplay) {
      console.error("display is undefine");
      return;
    }
    if (z === undefined) z = 0;
    this.mX = x;
    this.mY = y;
    this.mZ = z;
    this.mDisplay.setPosition(x, y, z);
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
    // const point = room.transformTo45(new Point3(this.mX, this.mY, this.mZ));
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
     }
    }
  }

  protected createDisplay() {
    if (!this.mDisplayInfo) return;
  }

  get roomService(): IRoomService {
    if (!this.mElementManager) {
      console.error("element manager is undefined");
      return;
    }
    return this.mElementManager.roomService;
  }

  set block(val: Block) {
    this.mBlock = val;
  }

  get block(): Block {
    return this.mBlock;
  }
}
