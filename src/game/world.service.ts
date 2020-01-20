// World 作为所有模组的全局服务，Hold所有管理对象
import { ConnectionService } from "../net/connection.service";
import { RoomManager } from "../rooms/room.manager";
import { Size } from "../utils/size";
import { IRoomService } from "../rooms/room";
import { IElementStorage } from "./element.storage";
import { UiManager } from "../ui/ui.manager";
import { InputManager } from "./input.service";
import { Account } from "./account";
import { HttpService } from "../net/http.service";
import { ILauncherConfig } from "../../launcher";
import { Clock } from "../rooms/clock";
import { MouseManager } from "./mouse.manager";

export interface WorldService {
    connection: ConnectionService;
    clock: Clock;
    moveStyle: number;
    readonly game: Phaser.Game;
    readonly roomManager: RoomManager;
    readonly elementStorage: IElementStorage;
    readonly uiManager: UiManager;
    readonly inputManager: InputManager;
    readonly mouseManager: MouseManager;
    readonly httpService: HttpService;
    readonly uiScale: number;
    readonly account: Account;
    readonly emitter: Phaser.Events.EventEmitter;

    reconnect();
    startHeartBeat();
    changeScene();
    getSize(): Size;
    getConfig(): ILauncherConfig;
    getGameConfig(): Phaser.Types.Core.GameConfig;

    changeRoom(room: IRoomService);

    startFullscreen();
    stopFullscreen();

    closeGame();
}
