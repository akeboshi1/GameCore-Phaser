
import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { FramesDisplay } from "../display/frames.display";
import { op_client } from "pixelpai_proto";
import { FramesModel } from "../display/frames.model";

export class Terrain extends Element {
  protected mDisplay: FramesDisplay | undefined;
  constructor(data: op_client.ITerrain, mElementManager: IElementManager) {
    super(undefined, mElementManager);
    // this.mDisplayInfo = new FramesModel();
  }

  public setPosition(x: number, y: number, z?: number) {
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
    if (this.mDisplay) {
      this.mDisplay.x = point.x;
      this.mDisplay.y = point.y;
      this.mDisplay.z = z;
      this.mDisplay.depth = point.x + point.y;
    }
    this.setBlock();
    // this.mDisplay.setPosition(x, y, z);
  }

  public addDisplay() {
    if (!this.mDisplay) {
     this.createDisplay();
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
