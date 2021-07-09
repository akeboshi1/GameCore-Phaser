var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseCamerasManager } from "baseRender";
import { PBpacket } from "net-socket-packet";
import { op_editor } from "pixelpai_proto";
export class EditorCamerasManager extends BaseCamerasManager {
  constructor(sceneEditor) {
    super();
    this.sceneEditor = sceneEditor;
    __publicField(this, "connection");
    this.connection = this.sceneEditor.connection;
  }
  centerCamera() {
    if (!this.mMain) {
      return;
    }
    const roomSize = this.sceneEditor.roomSize;
    this.mMain.setScroll(-this.mMain.width >> 1, roomSize.sceneHeight - this.mMain.height >> 1);
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
    const content = pkt.content;
    content.x = this.mMain.scrollX;
    content.y = this.mMain.scrollY;
    content.width = this.mMain.width;
    content.height = this.mMain.height;
    this.connection.send(pkt);
  }
  syncCameraScroll() {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
    const content = pkt.content;
    content.x = this.mMain.scrollX / this.zoom;
    content.y = this.mMain.scrollY / this.zoom;
    content.width = 0;
    content.height = 0;
    this.connection.send(pkt);
  }
}
