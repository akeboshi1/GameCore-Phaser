
import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { FramesDisplay } from "../display/frames.display";

export class Terrain extends Element {
  protected mDisplay: FramesDisplay | undefined;
  constructor(mElementManager: IElementManager) {
    super(mElementManager);
  }

  public setPosition(x: number, y: number, z?: number) {
    if (!this.mDisplay) {
      console.error("display is undefine");
      return;
    }
    const roomService = this.mElementManager.roomService;
    if (!roomService) {
      console.error("room is undefine");
      return;
    }
    const point = roomService.transformTo90(new Phaser.Geom.Point(x, y));
    if (!point) {
      console.error("transform error");
      return;
    }
    if (z === undefined) z = 0;
    this.mX = point.x;
    this.mY = point.y;
    this.mZ = point.z;
    this.mDisplay.x = point.x;
    this.mDisplay.y = point.y;
    this.mDisplay.z = z;
    this.setBlock();
    // this.mDisplay.setPosition(x, y, z);
  }

  public addDisplay() {
    if (!this.mDisplay) {
     // todo create display;
     return;
    }
    if (!this.mElementManager) {
      console.error("element manager is undefined");
      return;
    }
    const room = this.mElementManager.roomService;
    if (!room) {
      console.error("roomService is undefined");
      return;
    }
    room.addToGround(this.mDisplay);
  }
}
