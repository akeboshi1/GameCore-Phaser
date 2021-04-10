import { PacketHandler, PBpacket } from "net-socket-packet";
import { SceneEditorCanvas } from "../scene.editor.canvas";
import { op_client, op_editor, op_def } from "pixelpai_proto";
import { IScenery } from "structure";
import { BlockManager, Scenery } from "baseRender";
import { Logger } from "utils";

export class EditorSkyboxManager extends PacketHandler {
    private blocks: Map<number, BlockManager>;
    private mSelected: BlockManager;
    constructor(private sceneEditor: SceneEditorCanvas) {
        super();
        this.blocks = new Map();
        const connection = sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SCENERY, this.onAddSceneryHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_UPDATE_SCENERY, this.onUpdateSceneryHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SCENERY, this.onDeleteSceneryHandler);
        }
    }

    destroy() {
        const connection = this.sceneEditor.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
        this.blocks.forEach((block) => block.destroy());
        this.blocks.clear();
    }

    add(scenery: IScenery) {
        const block = new BlockManager(scenery, this.sceneEditor);
        this.blocks.set(scenery.id, block);
    }

    update(scenery: IScenery) {
        const blockManager = this.blocks.get(scenery.id);
        if (blockManager) {
            blockManager.update(scenery);
        }
    }

    remove(id: number) {
        const blockManager = this.blocks.get(id);
        if (blockManager) {
            blockManager.destroy();
        }
    }

    fetch(id: number) {
        this.mSelected = this.blocks.get(id);
        // this.editorSkyboxManager.fetch(content.id);
    }

    unselected() {
        this.mSelected = undefined;
    }

    public move(pointer: Phaser.Input.Pointer) {
        if (!this.mSelected) {
            return;
        }
        const scenery = this.mSelected.scenery;
        if (!scenery) {
            return;
        }
        const offset = scenery.offset;
        offset.x += (pointer.x - pointer.prevPosition.x) / this.sceneEditor.scaleRatio;
        offset.y += (pointer.y - pointer.prevPosition.y) / this.sceneEditor.scaleRatio;
        this.mSelected.updatePosition();
        this.onSyncSceneryOffset();
    }

    private onAddSceneryHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ADD_SCENERY = packet.content;
        this.add(new Scenery(content));
    }

    private onUpdateSceneryHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_UPDATE_SCENERY = packet.content;
        this.update(new Scenery(content));
    }

    private onDeleteSceneryHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_DELETE_SCENERY = packet.content;
        const ids = content.ids;
        for (const id of ids) {
            this.remove(id);
        }
    }

    private onSyncSceneryOffset() {
        const scenery = this.mSelected.scenery;
        const packet = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_UPDATE_SCENERY);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_UPDATE_SCENERY = packet.content;
        content.id = scenery.id;
        const offset = op_def.PBPoint2f.create();
        Object.assign(offset, scenery.offset);
        Logger.getInstance().log("======>>>: ", offset);
        content.offset = offset;
        this.sceneEditor.connection.send(packet);
    }
}
