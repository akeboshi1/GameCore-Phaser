import { BaseHandler, BaseStateManager } from "./base.state.manager";
export class RoomStateManager extends BaseStateManager {
  constructor(room) {
    super(room);
  }
  init() {
    this.add = new AddHandler(this.room);
    this.delete = new DeleteHandler(this.room);
  }
}
class AddHandler extends BaseHandler {
  constructor(room) {
    super(room);
  }
  skyBoxAnimation(state) {
    const buf = Buffer.from(state.packet);
    const len = buf.readUInt32BE(0);
    const content = buf.slice(4);
    if (len === content.length) {
      this.room.game.renderPeer.updateSkyboxState(JSON.parse(content.toString()));
    }
  }
  setCameraBounds(state) {
    const buf = Buffer.from(state.packet);
    if (!buf) {
      return;
    }
    let x = null;
    let y = null;
    let width = buf.readDoubleBE(0);
    let height = buf.readDoubleBE(8);
    if (buf.length >= 24) {
      x = width;
      y = height;
      width = buf.readDoubleBE(16);
      height = buf.readDoubleBE(24);
    }
    if (!width || !height) {
      return;
    }
    const roomSize = this.room.roomSize;
    const scaleRatio = this.room.game.scaleRatio;
    x = -width * 0.5 + (x ? x : 0);
    y = (roomSize.sceneHeight - height) * 0.5 + (y ? y : 0);
    x *= scaleRatio;
    y *= scaleRatio;
    width *= scaleRatio;
    height *= scaleRatio;
    this.room.game.renderPeer.setCamerasBounds(x, y, width, height);
  }
}
class DeleteHandler extends BaseHandler {
  constructor(room) {
    super(room);
  }
}
