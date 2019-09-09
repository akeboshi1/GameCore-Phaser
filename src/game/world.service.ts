// World 作为所有模组的全局服务，Hold所有管理对象
import { ConnectionService } from "../net/connection.service";
import { RoomManager } from "../rooms/room.manager";
import { SelectManager } from "../rooms/player/select.manager";
import { Size } from "../utils/size";
import { IRoomService } from "../rooms/room";
import { GameConfigService } from "../config/gameconfig.service";
import { IConfigObject } from "game-capsule/lib/configobjects/config_object";
import { JoyStickManager } from "./joystick.manager";
export interface WorldService {
    connection: ConnectionService;
    readonly game: Phaser.Game;
    readonly roomManager: RoomManager;
    readonly selectCharacterManager: SelectManager;
    readonly joyStickManager: JoyStickManager;
    readonly gameConfigService: GameConfigService;

    getSize(): Size;
    getServerTime(): number;
    changeRoom(room: IRoomService);
}
