import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { Room, IRoomService } from "./room";
import { op_client, op_def } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Logger } from "../utils/log";
import { EditorRoom } from "./editor.room";
import { DecorateRoom } from "./decorate.room";
import { Tool } from "../utils/tool";
import { Lite } from "game-capsule";
import { LoadingScene } from "../scenes/loading";
export interface IRoomManager {
    readonly world: WorldService | undefined;

    readonly currentRoom: IRoomService | undefined;

    readonly connection: ConnectionService | undefined;

    addPackListener();
    removePackListener();
}

export class RoomManager extends PacketHandler implements IRoomManager {
    protected mWorld: WorldService;
    private mRooms: IRoomService[] = [];
    private mCurRoom: IRoomService;

    constructor(world: WorldService) {
        super();
        this.mWorld = world;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterSceneHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_READY, this.onEnterDecorate);
    }

    public addPackListener() {
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    }

    public getRoom(id: number): IRoomService | undefined {
        // const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        // if (idx >= 0) {
        //     return this.mRooms[idx];
        // }
        return this.mRooms.find((room: Room) => {
            return room.id === id;
        });
    }

    public onFocus() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.resume(room.scene.scene.key);
        });
    }

    public onBlur() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.pause();
        });
    }

    public pasuseRoom(id: number) {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            const room: IRoomService = this.mRooms[idx];
            room.pause();
        }
    }

    public resumeRoom(id: number) {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            const room: IRoomService = this.mRooms[idx];
            if (room && room.scene) room.resume(room.scene.scene.key);
        }
    }

    public stop() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.destroy();
        });
    }

    public resize(width: number, height: number) {
        this.mRooms.forEach((room: Room) => {
            if (room) room.resize(width, height);
        });
    }

    public destroy() {
        this.removePackListener();
        for (let room of this.mRooms) {
            room.destroy();
            room = null;
        }
        this.mRooms.length = 0;
    }

    private hasRoom(id: number): boolean {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        return idx >= 0;
    }

    private async onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        // this.destroy();
        const vw = scene;
        let room: Room;
        if (this.hasRoom(vw.scene.id)) {
            room = <Room>this.getRoom(vw.scene.id);
            if (this.mCurRoom) {
                await this.leaveScene(this.mCurRoom);
            }
            room.addActor(vw.actor);
            room.enter(vw.scene);
            this.mCurRoom = room;
        } else {
            // load this scene config in gameConfig
            this.world.loadSceneConfig(vw.scene.id.toString()).then(async (config: Lite) => {
                this.world.elementStorage.setSceneConfig(config);
                if (this.mCurRoom) {
                    await this.leaveScene(this.mCurRoom);
                }
                room = new Room(this);
                this.mRooms.push(room);
                room.addActor(vw.actor);
                room.enter(vw.scene);
                this.mCurRoom = room;
            });
        }
    }

    private onEnterDecorate(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        if (this.mCurRoom) {
            this.leaveScene(this.mCurRoom);
        }
        const room: DecorateRoom = new DecorateRoom(this);
        room.enter(scene.scene);
        const actor = scene.actor;
        if (actor) room.setEnterPos(actor.x, actor.y);
        this.mRooms.push(room);
        this.mCurRoom = room;
    }

    private onEditRoom(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE = packet.content;
        Logger.getInstance().log("edit: ", content);
    }

    private onEnterEditor(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        const room = new EditorRoom(this);
        room.enter(content.scene);
        this.mCurRoom = room;
        this.mRooms.push(room);
    }

    private async leaveScene(room: IRoomService) {
        if (!room) return;
        return new Promise((resolve, reject) => {
            const loading: LoadingScene = <LoadingScene> this.mWorld.game.scene.getScene(LoadingScene.name);
            if (loading) {
                loading.show().then(() => {
                    this.mRooms = this.mRooms.filter((r: IRoomService) => r.id !== room.id);
                    room.destroy();
                    resolve();
                });
            }
        });
    }

    private onEnterSceneHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        const scene = content.scene;
        switch (scene.sceneType) {
            case op_def.SceneTypeEnum.NORMAL_SCENE_TYPE:
                this.onEnterScene(content);
                break;
            case op_def.SceneTypeEnum.EDIT_SCENE_TYPE:
                this.onEnterDecorate(content);
                break;
        }
    }

    get world(): WorldService {
        return this.mWorld;
    }

    get currentRoom(): Room {
        return <Room>this.mCurRoom;
    }

    get connection(): ConnectionService {
        if (this.mWorld) {
            return this.mWorld.connection;
        }
        Logger.getInstance().error("world manager is undefined");
    }
}
