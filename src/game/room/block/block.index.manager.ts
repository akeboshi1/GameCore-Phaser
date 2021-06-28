import { IRectangle, Logger, Tool } from "utils";
import { IRoomService } from "../index";
import { op_virtual_world, op_def } from "pixelpai_proto";
import { BlockIndex } from "./block.index";
import { PBpacket } from "net-socket-packet";

export class BlockIndexManager {
    private preBlockIndex: number[] = [];
    private zoom: number;
    constructor(private room: IRoomService) {
        this.zoom = room.game.scaleRatio;
    }

    async checkBlockIndex(cameraView: IRectangle) {
        const blockIndex = new BlockIndex().getBlockForCameras(cameraView, this.room.roomSize);
        if (!Tool.equalArr(this.preBlockIndex, blockIndex)) {
            this.syncBlockIndex(blockIndex);
        }
    }

    private syncBlockIndex(blockIndex: number[]) {
        const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_HOT_BLOCK);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_HOT_BLOCK = pkt.content;
        content.blockIndex = blockIndex;
        this.room.game.connection.send(pkt);

        // TODO 根据blockIndex新增获取pi物件
        const newIndex = blockIndex.filter((index) => this.preBlockIndex.includes(index) === false);
        const elementStorage = this.room.game.elementStorage;
        // const remove = this.preBlockIndex.filter((index) => blockIndex.includes(index) === false);
        const element = elementStorage.getElementFromBlockIndex(newIndex, op_def.NodeType.ElementNodeType);
        this.room.elementManager.addDisplayRef(element);
        const terrain = elementStorage.getElementFromBlockIndex(newIndex, op_def.NodeType.TerrainNodeType);
        this.room.terrainManager.addDisplayRef(terrain);
        this.preBlockIndex = blockIndex;
    }
}
