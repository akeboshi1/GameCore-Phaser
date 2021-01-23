import { BaseCamerasManager } from "base";
import { PBpacket } from "net-socket-packet";
import { op_editor } from "pixelpai_proto";
import { SceneEditorCanvas } from "../scene.editor.canvas";

export class EditorCamerasManager extends BaseCamerasManager {
    private connection: any;
    constructor(private sceneEditor: SceneEditorCanvas) {
        super();
        this.connection = this.sceneEditor.connection;
    }

    public centerCamera() {
        if (!this.mMain) {
            return;
        }
        const roomSize = this.sceneEditor.roomSize;
        this.mMain.setScroll(
            (-this.mMain.width) >> 1,
            (roomSize.sceneHeight - this.mMain.height) >> 1
        );
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = this.mMain.scrollX;
        content.y = this.mMain.scrollY;
        content.width = this.mMain.width;
        content.height = this.mMain.height;
        this.connection.send(pkt);
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
