import { op_client, op_def } from "pixelpai_proto";
import { IRoomService, Room } from "./room/room";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { Game } from "../game";
import { ConnectionService } from "../../../lib/net/connection.service";
// import { Logger } from "utils";
import { Lite } from "game-capsule";
import { Logger } from "utils";
export interface IRoomManager {
    readonly game: Game | undefined;

    readonly currentRoom: IRoomService | undefined;

    readonly connection: ConnectionService | undefined;

    addPackListener();
    removePackListener();
}

export class RoomManager extends PacketHandler implements IRoomManager {
    protected mGame: Game;
    private mRooms: IRoomService[] = [];
    private mCurRoom: IRoomService;
    constructor(game: Game) {
        super();
        this.mGame = game;
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterSceneHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_READY, this.onEnterDecorate);
    }

    public update(time: number, delay: number) {
        if (this.mCurRoom) this.mCurRoom.update(time, delay);
    }

    public addPackListener() {
        if (this.connection) {
            Logger.getInstance().log("roommanager addPackListener");
            this.connection.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.connection) {
            Logger.getInstance().log("roommanager removePackListener");
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

    public destroy() {
        this.removePackListener();
        for (let room of this.mRooms) {
            room.destroy();
            room = null;
        }
        this.mRooms.length = 0;
        this.mCurRoom = null;
    }

    private hasRoom(id: number): boolean {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        return idx >= 0;
    }

    private async onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        // this.destroy();
        Logger.getInstance().log("===========enter scene=====0");
        const vw = scene;
        if (this.mCurRoom) {
            // 客户端会接受到多次进入场景消息，这边客户端自己处理下，防止一个房间多次创建
            if (this.mCurRoom.id === vw.scene.id) return;
            await this.leaveRoom(this.mCurRoom);
        }
        if (this.hasRoom(vw.scene.id)) {
            Logger.getInstance().log("===========enter scene=====1");
            this.onEnterRoom(scene);
        } else {
            this.mGame.loadSceneConfig(vw.scene.id.toString()).then(async (config: Lite) => {
                Logger.getInstance().log("=======enter scene load sceneConfig");
                this.game.elementStorage.setSceneConfig(config);
                this.onEnterRoom(scene);
            });
        }
    }

    private onEnterRoom(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        Logger.getInstance().log("enter===room");
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

    private async onEnterDecorate(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        // if (this.mCurRoom) {
        //     await this.leaveRoom(this.mCurRoom);
        // }
        // const room: DecorateRoom = new DecorateRoom(this);
        // room.enter(scene.scene);
        // const actor = scene.actor;
        // if (actor) room.setEnterPos(actor.x, actor.y);
        // this.mRooms.push(room);
        // this.mCurRoom = room;
    }

    private onEnterEditor(packet: PBpacket) {
        // const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        // const room = new EditorRoom(this);
        // room.enter(content.scene);
        // this.mCurRoom = room;
        // this.mRooms.push(room);
    }

    private async leaveRoom(room: IRoomService) {
        if (!room) return;
        this.mRooms = this.mRooms.filter((r: IRoomService) => r.id !== room.id);
        room.destroy();
        // await
        // this.mGame.leaveRoom(room);
        // Logger.getInstance().log("===========leaveRoom");
        // return new Promise((resolve, reject) => {
        //     const loading: LoadingScene = <LoadingScene>this.mWorld.game.scene.getScene(LoadingScene.name);
        //     if (loading) {
        //         loading.show().then(() => {
        //             this.mRooms = this.mRooms.filter((r: IRoomService) => r.id !== room.id);
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

    get game(): Game {
        return this.mGame;
    }

    get currentRoom(): Room {
        return <Room>this.mCurRoom;
    }

    get connection(): ConnectionService {
        if (this.mGame) {
            return this.mGame.connection;
        }
    }
}
