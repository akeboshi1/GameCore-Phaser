import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { Room, IRoomService } from "./room";
import { op_client, op_def } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Logger } from "../utils/log";
import {EditorRoom} from "./editor.room";
import {DecorateRoom} from "./decorate.room";
import { IElement } from "./element/element";

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
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterScene);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_READY, this.onEnterDecorate);
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

    private onEnterScene(packet: PBpacket) {
        // this.destroy();
        const vw: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        let room: Room;
        if (this.hasRoom(vw.scene.id)) {
            room = <Room> this.getRoom(vw.scene.id);
        } else {
            if (this.mCurRoom) {
                this.leaveScene(this.mCurRoom);
            }
            room = new Room(this);
            this.mRooms.push(room);
        }
        room.addActor(vw.actor);
        room.enter(vw.scene);
        // this.mWorld.changeRoom(room);
        this.mCurRoom = room;
    }

    private onEnterDecorate(packet: PBpacket) {
        const { rows, cols, tileWidth, tileHeight } = this.mCurRoom.roomSize;
        const elements = this.mCurRoom.elementManager.getElements().map((ele: IElement) => ele.model);
        const terrains = this.mCurRoom.terrainManager.getElements().map((ele: IElement) => ele.model);
        const scene = {
            id: this.mCurRoom.id,
            rows,
            cols,
            tileWidth,
            tileHeight
        };
        if (this.mCurRoom) {
            this.leaveScene(this.mCurRoom);
        }
        // const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        const room: DecorateRoom = new DecorateRoom(this);
        room.enter(scene);
        setTimeout(() => {
            room.addElements(elements, op_def.NodeType.ElementNodeType);
            room.addElements(terrains, op_def.NodeType.TerrainNodeType);
        }, 2000);
        this.mRooms.push(room);
        // this.mCurRoom = room;
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

    private leaveScene(room: IRoomService) {
        if (!room) return;
        this.mRooms = this.mRooms.filter((r) => r.id !== room.id);
        room.destroy();
    }

    get world(): WorldService {
        return this.mWorld;
    }

    get currentRoom(): Room {
        return <Room> this.mCurRoom;
    }

    get connection(): ConnectionService {
        if (this.mWorld) {
            return this.mWorld.connection;
        }
        Logger.getInstance().error("world manager is undefined");
    }
}
