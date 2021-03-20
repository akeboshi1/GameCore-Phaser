import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaPartyNavigation extends BasicModel {
    constructor(game: Game) {
        super(game);
        this.register();
    }
    register() {
        const connection = this.connection;
        if (connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST, this.on_PARTY_LIST);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS, this.on_PLAYER_PROGRESS);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST, this.onRoomListHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY, this.onMyRoomListHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM, this.onEnterRoomResultHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ROOM_LIST, this.onNewRoomListHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELF_ROOM_LIST, this.onNewSelfRoomListHandler);
        }
    }

    unregister() {
        const connection = this.connection;
        if (connection) {
            this.connection.removePacketListener(this);
        }
    }

    destroy() {
        this.unregister();
    }

    get connection(): ConnectionService {
        if (this.game) {
            return this.game.connection;
        }
    }

    public query_PARTY_LIST() {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_PARTY_LIST);
        this.connection.send(packet);
    }
    public queryEnterRoom(roomID: string, password?: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENTER_ROOM = packet.content;
        content.roomId = roomID;
        content.password = password;
        this.connection.send(packet);
    }
    public query_PLAYER_PROGRESS(name: string) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_PLAYER_PROGRESS);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_QUERY_PLAYER_PROGRESS = packet.content;
        content.name = name;
        this.connection.send(packet);
    }

    public query_PLAYER_PROGRESS_REWARD(index: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_PLAYER_PROGRESS_REWARD);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_PLAYER_PROGRESS_REWARD = packet.content;
        content.index = index;
        content.name = "online";
        this.connection.send(packet);
    }

    public query_GET_ROOM_LIST(page: number, perPage: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_ROOM_LIST);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_ROOM_LIST = packet.content;
        content.page = page;
        content.perPage = perPage;
        this.connection.send(packet);
    }

    public query_ROOM_HISTORY() {
        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY));
    }
    public query_ROOM_LIST(roomType: number, page?: number, perPage?: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_ROOM_LIST);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_ROOM_LIST = packet.content;
        content.roomType = roomType;
        content.page = page;
        content.perPage = perPage;
        this.connection.send(packet);
    }
    public query_SELF_ROOM_LIST(roomType: number) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SELF_ROOM_LIST);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_SELF_ROOM_LIST = packet.content;
        content.roomType = roomType;
        this.connection.send(packet);
    }
    private on_PARTY_LIST(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_PARTY_LIST = packet.content;
        this.game.emitter.emit(ModuleName.PICAPARTYNAVIGATION_NAME + "_questlist", content);
    }
    private on_PLAYER_PROGRESS(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_PLAYER_PROGRESS = packet.content;
        if (content.name === "online")
            this.game.emitter.emit(ModuleName.PICAPARTYNAVIGATION_NAME + "_progresslist", content);
    }

    private onRoomListHandler(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST = packet.content;
        this.game.emitter.emit(ModuleName.PICAPARTYNAVIGATION_NAME + "_roomList", content);
    }

    private onMyRoomListHandler(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY = packet.content;
        this.game.emitter.emit(ModuleName.PICAPARTYNAVIGATION_NAME + "_myRoomList", content);
    }

    private onEnterRoomResultHandler(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM = packet.content;
        this.game.emitter.emit(ModuleName.PICAPARTYNAVIGATION_NAME + "_enterRoomResult", content);
    }
    private onNewRoomListHandler(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_ROOM_LIST = packet.content;
        this.game.emitter.emit(ModuleName.PICAPARTYNAVIGATION_NAME + "_newroomlist", content);
    }

    private onNewSelfRoomListHandler(packet: PBpacket) {
        const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SELF_ROOM_LIST = packet.content;
        this.game.emitter.emit(ModuleName.PICAPARTYNAVIGATION_NAME + "_newselfroomlist", content);
    }
}
