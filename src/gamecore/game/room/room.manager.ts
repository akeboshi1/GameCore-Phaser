import { op_client } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "../game";
import { IRoomService, Room } from "./room";
import { ConnectionService, Logger } from "structure";

export interface IRoomManager {
    readonly game: Game | undefined;

    readonly currentRoom: IRoomService | undefined;

    readonly connection: ConnectionService | undefined;

    removeAllRoom();

    addPackListener();

    removePackListener();
}

export class RoomManager extends PacketHandler implements IRoomManager {
    protected mGame: Game;
    protected mRooms: IRoomService[] = [];
    protected mCurRoom: IRoomService;

    constructor(game: Game) {
        super();
        this.mGame = game;
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM, this.onEnterResult);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_READY, this.onEnterDecorate);
    }

    public update(time: number, delay: number) {
        if (this.mCurRoom) this.mCurRoom.update(time, delay);
    }

    public addPackListener() {
        if (this.connection) {
            Logger.getInstance().debug("roommanager addPackListener");
            this.connection.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.connection) {
            Logger.getInstance().debug("roommanager removePackListener");
            this.connection.removePacketListener(this);
        }
    }

    public getRoom(id: number): IRoomService | undefined {
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

    public removeAllRoom() {
        for (let room of this.mRooms) {
            room.destroy();
            room = null;
        }
        this.mRooms.length = 0;
        this.mCurRoom = null;
    }

    public hasRoom(id: number): boolean {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        return idx >= 0;
    }

    public async leaveRoom(room: IRoomService) {
        if (!room) return;
        this.mRooms = this.mRooms.filter((r: IRoomService) => r.id !== room.id);
        room.destroy();
    }

    public onEnterRoom(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        Logger.getInstance().debug("enter===room");
        const id = scene.scene.id;
        let boo: boolean = false;
        // tslint:disable-next-line:no-shadowed-variable
        this.mRooms.forEach((room) => {
            if (room && room.id === id) {
                boo = true;
                return;
            }
        });
        if (boo) return;
        const room = new Room(this);
        this.mRooms.push(room);
        room.addActor(scene.actor);
        room.enter(scene.scene);
        this.mCurRoom = room;
    }

    public destroy() {
        this.removePackListener();
        this.removeAllRoom();
    }

    private onEnterEditor(packet: PBpacket) {
        // const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        // const room = new EditorRoom(this);
        // room.enter(content.scene);
        // this.mCurRoom = room;
        // this.mRooms.push(room);
    }

    private onEnterResult(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM = packet.content;
        if (!content.result) {
            return;
        }
        const tips = [undefined, "commontips.room_full", "commontips.room_need_password", "commontips.room_password_failure", "commontips.room_dose_not_exists"];
        const tip = tips[content.result - 1];
        if (tip) this.game.renderPeer.showAlert(tip);
    }

    get game(): Game {
        return this.mGame;
    }

    get currentRoom(): IRoomService {
        return this.mCurRoom;
    }

    get connection(): ConnectionService {
        if (this.mGame) {
            return this.mGame.connection;
        }
    }
}
