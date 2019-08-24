// World 作为所有模组的全局服务，Hold所有管理对象
import { ConnectionService } from "../net/connection.service";
import { RoomManager } from "../rooms/room.manager";
import { SelectManager } from "../rooms/player/select.manager";
import { Size } from "../utils/size";
export interface WorldService {
    connection: ConnectionService;

    getSize(): Size;

    readonly game: Phaser.Game;

    readonly roomManager: RoomManager;

    readonly selectCharacterManager: SelectManager;
}
