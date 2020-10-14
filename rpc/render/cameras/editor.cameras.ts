import { RoomCameras } from "./room.cameras";
import { PBpacket } from "net-socket-packet";
import { op_editor } from "pixelpai_proto";

export class EditorCamerasManager extends RoomCameras {
    public centerCameas() {
        if (!this.mMain || !this.mRoomService) {
            return;
        }
        const roomSize = this.mRoomService.roomSize;
        this.mMain.setScroll(
            (roomSize.sceneWidth - this.mMain.width) >> 1,
            (roomSize.sceneHeight - this.mMain.height) >> 1
        );
        const cameraView = this.mMain.worldView;
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = this.mMain.scrollX;
        content.y = this.mMain.scrollY;
        content.width = this.mMain.width;
        content.height = this.mMain.height;
        this.connection.send(pkt);
    }

    public offsetScroll(x: number, y: number) {
        if (!this.mMain) {
            return;
        }

        for (const camera of this.mCameras) {
            camera.scrollX += x / this.zoom;
            camera.scrollY += y / this.zoom;
        }
        // this.mMain.scrollX += x / this.zoom;
        // this.mMain.scrollY += y / this.zoom;
        // this.mCamera.setScroll(x, y);

        // const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        // const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        // content.x = this.mMain.scrollX / this.zoom;
        // content.y = this.mMain.scrollY / this.zoom;
        // content.width = 0;
        // content.height = 0;
        // this.connection.send(pkt);
    }

    public syncCameraScroll() {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = this.mMain.scrollX / this.zoom;
        content.y = this.mMain.scrollY / this.zoom;
        content.width = 0;
        content.height = 0;
        this.connection.send(pkt);
    }
}
