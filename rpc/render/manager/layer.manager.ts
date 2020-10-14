import { constants } from "buffer";
import { Export, RPCEmitter } from "webworker-rpc";
import { Logger } from "../../utils/log";
import { ElementDisplay } from "../display/element.display";
import { RoomLayers } from "../layer/room.layers";
import { SceneManager } from "./scene.manager";

export class LayerManager extends RPCEmitter {
    private roomLayersMap: Map<number, RoomLayers> = new Map<number, RoomLayers>();

    constructor(private sceneManager: SceneManager) {
        super();
    }

    @Export()
    public addRoomLayers(room: any) {
        if (this.roomLayersMap.has(room.id)) {
            Logger.getInstance().warn("RoomLayers exit: ", room.id);
        }
        this.roomLayersMap.set(room.id, new RoomLayers(room, this.sceneManager));
    }

    @Export()
    public removeRoomLayers(roomID: number) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.destroy();
        this.roomLayersMap.delete(roomID);
    }

    @Export()
    public addToGround(roomID: number, ele: ElementDisplay | ElementDisplay[], index?: number) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.addToGround(ele, index);
    }

    @Export()
    public addToSurface(roomID: number, ele: ElementDisplay | ElementDisplay[]) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.addToSurface(ele);
    }

    @Export()
    public addToSceneToUI(roomID: number, child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.addToSceneToUI(child);
    }

    @Export()
    public addToAtmosphere(roomID: number, child: Phaser.GameObjects.GameObject) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.addToAtmosphere(child);
    }

    @Export()
    public addToMiddle(roomID: number, child: Phaser.GameObjects.GameObject) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.addToMiddle(child);
    }

    @Export()
    public resize(roomID: number, width: number, height: number) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.resize(width, height);
    }

    @Export()
    public sortSurface(roomID: number) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.sortSurface();
    }

    @Export()
    public changeScene(roomID: number) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.changeScene();
    }

    @Export()
    public drawGrid(room: any) {
        if (!this.roomLayersMap.has(room.id)) {
            Logger.getInstance().error("RoomLayers not found: ", room.id);
            return;
        }
        const roomLayers = this.roomLayersMap.get(room.id);
        roomLayers.drawGrid(room);
    }

    @Export()
    public setGridVisible(roomID: number, visible: boolean) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.setGridVisible(visible);
    }

    @Export()
    public update(roomID: number, time: number, delta: number) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.update(time, delta);
    }

    @Export()
    public setSurfaceInteractive(roomID: number, val: boolean) {
        if (!this.roomLayersMap.has(roomID)) {
            Logger.getInstance().error("RoomLayers not found: ", roomID);
            return;
        }
        const roomLayers = this.roomLayersMap.get(roomID);
        roomLayers.setSurfaceInteractive(val);
    }
}
