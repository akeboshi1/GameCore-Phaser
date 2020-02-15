import { CamerasManager } from "./cameras.manager";
import { PBpacket } from "net-socket-packet";
import { op_editor } from "pixelpai_proto";

export class EditorCamerasManager extends CamerasManager {
    public centerCameas() {
        if (!this.mCamera || !this.mRoomService) {
            return;
        }
        const roomSize = this.mRoomService.roomSize;
        this.mCamera.setScroll((roomSize.sceneWidth - this.mCamera.width >> 1), (roomSize.sceneHeight - this.mCamera.height >> 1));
        const cameraView = this.mCamera.worldView;
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = this.mCamera.scrollX;
        content.y = this.mCamera.scrollY;
        content.width = this.mCamera.width;
        content.height = this.mCamera.height;
        this.connection.send(pkt);
    }

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
