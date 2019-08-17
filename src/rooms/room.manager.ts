import {ElementManager} from "./element/element.manager";
import {PlayerManager} from "./player/player.mamager";
import {WorldService} from "../game/world.service";
import {ConnectionService} from "../net/connection.service";
import {Room} from "./room";

export interface IRoomManager {
    readonly connection: ConnectionService;
    readonly scene: Phaser.Scene;
}

export class RoomManager implements IRoomManager {
    protected mWorld: WorldService;
    protected mRoomList: Room[] = [];

    constructor(world: WorldService) {
        this.mWorld = world;
    }

    get scene(): Phaser.Scene {
        // TODO
        return;
    }

    get connection(): ConnectionService {
        return this.mWorld.connection;
    }
}
