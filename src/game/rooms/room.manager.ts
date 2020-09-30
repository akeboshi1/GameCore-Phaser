import { Room, ILogicRoomService } from "./room";
import { op_client, op_def } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { World } from "../world";
import { DecorateRoom } from "./decorate.room";
import { EditorRoom } from "./editor.room";
import { ConnectionService } from "../../../lib/net/connection.service";
export interface IRoomManager {
    readonly world: World | undefined;

    readonly currentRoom: ILogicRoomService | undefined;

    readonly connection: ConnectionService | undefined;

    addPackListener();
    removePackListener();
}

export class RoomManager extends PacketHandler implements IRoomManager {
    protected mWorld: World;
    private mRooms: ILogicRoomService[] = [];
    private mCurRoom: ILogicRoomService;

    constructor(world: World) {
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

    public getRoom(id: number): ILogicRoomService | undefined {
        return this.mRooms.find((room: Room) => {
            return room.id === id;
        });
    }

    public onFocus() {
        this.mRooms.forEach((room: Room) => {
            if (room) room.resume();
        });
    }

    public onBlur() {
        this.mRooms.forEach((room: Room) => {
            if (room) room.pause();
        });
    }

    public stop() {
        this.mRooms.forEach((room: Room) => {
            if (room) room.destroy();
        });
    }

    public destroy() {
        this.removePackListener();
        this.mCurRoom = null;
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

    private onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        // this.destroy();
        const vw = scene;
        if (this.hasRoom(vw.scene.id)) {
            this.onEnterRoom(scene);
        } else {
            this.mWorld.loadSceneConfig(vw.scene.id);
        }
    }

    private async onEnterRoom(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        if (this.mCurRoom) {
            await this.leaveScene(this.mCurRoom);
        }
        const room = new Room(this);
        this.mRooms.push(room);
        room.addActor(scene.actor);
        room.enter(scene.scene);
        this.mCurRoom = room;
    }

    private async onEnterDecorate(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        if (this.mCurRoom) {
            await this.leaveScene(this.mCurRoom);
        }
        const room: DecorateRoom = new DecorateRoom(this);
        room.enter(scene.scene);
        const actor = scene.actor;
        if (actor) room.setEnterPos(actor.x, actor.y);
        this.mRooms.push(room);
        this.mCurRoom = room;
    }

    private onEnterEditor(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        const room = new EditorRoom(this);
        room.enter(content.scene);
        this.mCurRoom = room;
        this.mRooms.push(room);
    }

    private leaveScene(room: ILogicRoomService) {
        if (!room) return;
        this.mWorld.leaveScene(room);
        // return new Promise((resolve, reject) => {
        //     const loading: LoadingScene = <LoadingScene>this.mWorld.game.scene.getScene(LoadingScene.name);
        //     if (loading) {
        //         loading.show().then(() => {
        //             this.mRooms = this.mRooms.filter((r: ILogicRoomService) => r.id !== room.id);
        //             room.destroy();
        //             resolve();
        //         });
        //     }
        // });
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

    get world(): World {
        return this.mWorld;
    }

    get currentRoom(): Room {
        return <Room>this.mCurRoom;
    }

    get connection(): ConnectionService {
        if (this.mWorld) {
            return this.mWorld.connection;
        }
    }
}
