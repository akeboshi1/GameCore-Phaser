import { CamerasManager } from "./cameras.manager";
import { PBpacket } from "net-socket-packet";
import { op_editor } from "pixelpai_proto";

export class EditorCamerasManager extends CamerasManager {
    public offsetScroll(x: number, y: number) {
        if (!this.mCamera) {
            return;
        }
        this.mCamera.scrollX += x;
        this.mCamera.scrollY += y;
        // this.mCamera.setScroll(x, y);

        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = this.mCamera.scrollX;
        content.y = this.mCamera.scrollY;
        content.width = 0;
        content.height = 0;
        this.connection.send(pkt);
    }
}
