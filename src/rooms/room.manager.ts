import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { Room } from "./room";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { LoadingScene } from "../scenes/loading";
import { PlayScene } from "../scenes/play";
import { Logger } from "../utils/log";

export interface IRoomManager {
    readonly world: WorldService | undefined;

    readonly connection: ConnectionService | undefined;
}

export class RoomManager extends PacketHandler implements IRoomManager {
    protected mWorld: WorldService;
    private mRooms: Room[] = [];
    private mCurRoom: Room;

    constructor(world: WorldService) {
        super();
        this.mWorld = world;
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterScene);
        }
    }

    public getRoom(id: number): Room | undefined {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            return this.mRooms[idx];
        }
        return;
    }

    public pasuseRoom(id: number) {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            const room: Room = this.mRooms[idx];
            room.pause();
        }
    }

    public resumeRoom(id: number) {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            const room: Room = this.mRooms[idx];
            room.resume(room.scene.scene.key);
        }
    }

    public stop() {
        this.mRooms.forEach((room: Room) => {
            if (room) room.destroy();
        });
    }

    public resize(width: number, height: number) {
        this.mRooms.forEach((room: Room) => {
            if (room) room.resize(width, height);
        });
    }

    private hasRoom(id: number): boolean {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        return idx >= 0;
    }

    private onEnterScene(packet: PBpacket) {
        const vw: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        let room: Room;
        if (this.mCurRoom) {
            this.mCurRoom.clear();
        }
        if (this.hasRoom(vw.scene.id)) {
            room = this.getRoom(vw.scene.id);
        } else {
            room = new Room(this);
            this.mRooms.push(room);
        }
        room.addActor(vw.actor);
        room.enter(vw.scene);
        this.mWorld.changeRoom(room);
        this.mCurRoom = room;
    }

    get world(): WorldService {
        return this.mWorld;
    }

    get connection(): ConnectionService {
        if (this.mWorld) {
            return this.mWorld.connection;
        }
        Logger.error("world manager is undefined");
    }
}
