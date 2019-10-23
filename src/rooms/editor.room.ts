import {IRoomManager} from "./room.manager";
import {PBpacket} from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import {ElementManager} from "./element/element.manager";
import {Logger} from "../utils/log";
import {BrushEnum} from "../const/brush";
import {TerrainManager} from "./terrain/terrain.manager";
import {PlayerManager} from "./player/player.manager";
import { Room } from "./room";
import { LayerManager } from "./layer/layer.manager";
import {PlayScene} from "../scenes/play";

export class EditorRoom extends Room {
    clockSyncComplete: boolean;
    private mBrush: BrushEnum;
    constructor(manager: IRoomManager) {
        super(manager);
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.onSetEditorModeHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.onAlignGridHandler);
            this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.onVisibleGridHandler);
        }
    }

    public enter(data: op_client.IScene) {
        if (!data) {
            Logger.error("wrong room");
            return;
        }
        this.mID = data.id;

        // TODO 拆分enter, 通用的不用重写一遍
        this.mSize = {
            cols: data.rows,
            rows: data.cols,
            tileHeight: data.tileHeight,
            tileWidth: data.tileWidth,
            sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
            sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2),
        };

        this.mTerainManager = new TerrainManager(this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        this.mLayManager = new LayerManager(this);

        this.mWorld.game.scene.start(PlayScene.name, {
            room: this,
            callback: () => {
                this.mLayManager.drawGrid(this);
            }
        });
    }

    public destroy() {
        if (this.mWorld && this.mWorld.connection) {
            this.mWorld.connection.removePacketListener(this);
        }
        super.destroy();
    }

    private onSetEditorModeHandler(packet: PBpacket) {
        const mode: op_client.IOP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE = packet.content;
        // this.mBrush = mode.mode;
    }

    private onAlignGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ALIGN_GRID = packet.content;
    }

    private onVisibleGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_VISIBLE_GRID = packet.content;
        this.layerManager.setGridVisible(content.visible);
    }

    get brush(): BrushEnum {
        return this.mBrush;
    }
}
