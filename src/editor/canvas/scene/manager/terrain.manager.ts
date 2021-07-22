import {SceneEditor, SceneEditorCanvas} from "../scene.editor.canvas";
import {Ground} from "baseRender";
import {IPos, ITilesetProperty, LayerName, Logger} from "structure";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {op_client, op_def, op_editor} from "pixelpai_proto";

export class EditorTerrainManager extends PacketHandler {
    private mGround: Ground;

    constructor(protected sceneEditor: SceneEditorCanvas) {
        super();
        const connection = this.sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(this);
            // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, this.handleAddTerrains);
            // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS,
            //     this.handleDeleteTerrains
            // );
        }
    }

    destroy() {
        if (this.mGround) {
            this.mGround.destroy();
        }
        const connection = this.sceneEditor.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
    }

    create(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.mGround) {
                this.mGround.destroy();
            }
            this.mGround = new Ground(this.sceneEditor.scene, this.sceneEditor.url, this.sceneEditor.scaleRatio);
            (<SceneEditor> this.sceneEditor.scene).layerManager.addToLayer(LayerName.GROUND, this.mGround);
            this.mGround.load({id: this.sceneEditor.sceneNode.id + "", resRoot: this.sceneEditor.config.LOCAL_HOME_PATH})
                .then(() => {
                    const properties = this.mGround.getAllTilesetProperties();
                    this.sceneEditor.elementStorage.updateTilesets(properties);
                    resolve();
                })
                .catch(() => {
                    // 允许加载失败
                    resolve();
                });
        });
    }

    existTerrain(x: number, y: number) {
        if (!this.mGround) return false;
        return this.mGround.existTerrain(x, y);
    }

    addTerrains(terrainCoorData) {
        const index = this.sceneEditor.elementStorage.getTilesetIndexBySN(terrainCoorData.sn);
        if (index < 0) {
            Logger.getInstance().warn("no sn in tilesets: ", terrainCoorData.sn);
            return;
        }
        const drawLocs: op_def.IPBPoint3f[] = [];
        for (const pos of terrainCoorData.locs) {
            drawLocs.push({x: pos.x, y: pos.y, z: pos.z});
            this.changeGroundBySN(pos, terrainCoorData.sn);
        }
        this.reqEditorAddTerrainsData(drawLocs, index);
    }

    removeTerrains(locations: IPos[]) {
        for (const location of locations) {
            this.changeGroundByTilesetIndex(location, -1);
        }
        this.reqEditorDeleteTerrainsData(locations);
    }

    reqEditorAddTerrainsData(locs: op_def.IPBPoint3f[], key) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_ADD_TERRAINS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_ADD_TERRAINS = pkt.content;
        content.locs = locs;
        content.key = key;
        this.sceneEditor.connection.send(pkt);
    }

    reqEditorDeleteTerrainsData(loc: IPos[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS = pkt.content;
        content.locs = loc.map((item) => ({ x: item.x, y: item.y, z: item.z }));
        this.sceneEditor.connection.send(pkt);
    }

    protected changeGroundBySN(pos45: IPos, sn: string) {
        const index = this.sceneEditor.elementStorage.getTilesetIndexBySN(sn);
        this.changeGroundByTilesetIndex(pos45, index);
    }

    protected changeGroundByTilesetIndex(pos45: IPos, key: number) {
        this.mGround.changeAt(pos45, key);
    }
}
