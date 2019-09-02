
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
    if (this.mDisplay) {
      this.mDisplay.setPosition(this.mX, this.mY, 0);
      this.setDepth();
    }
    this.setBlock();
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

  protected setDepth() {
    if (this.mDisplay) {
      this.mDisplay.setDepth(this.mDisplay.y);
    }
  }

  protected onDisplayReady() {
    if (this.mDisplay) {
      const baseLoc = this.mDisplay.baseLoc;
      this.setPosition(this.mDisplayInfo.x, this.mDisplayInfo.y);
    }
  }
}
