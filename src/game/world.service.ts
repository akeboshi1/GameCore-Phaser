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
import { ISoundConfig } from "./sound.manager";
import { HttpClock } from "../rooms/http.clock";
import { PlayerDataManager } from "../rooms/data/PlayerDataManager";

export interface WorldService {
    connection: ConnectionService;
    clock: Clock;
    moveStyle: number;
    orientation: number;
    readonly game: Phaser.Game;
    readonly roomManager: RoomManager;
    readonly elementStorage: IElementStorage;
    readonly uiManager: UiManager;
    readonly inputManager: InputManager;
    readonly mouseManager: MouseManager;
    readonly playerDataManager: PlayerDataManager;
    readonly httpService: HttpService;
    readonly uiScale: number;
    readonly scaleRatio: number;
    readonly uiRatio: number;
    readonly account: Account;
    readonly emitter: Phaser.Events.EventEmitter;
    readonly httpClock: HttpClock;

    reconnect();
    startHeartBeat();
    changeScene();
    getSize(): Size;
    getConfig(): ILauncherConfig;
    getGameConfig(): Phaser.Types.Core.GameConfig;
    onFocus();
    onBlur();
    setKeyBoardHeight(height: number);
    changeRoom(room: IRoomService);

    startFullscreen();
    stopFullscreen();

    closeGame();

    loadSceneConfig(sceneId: string): Promise<any>;

    playSound(config: ISoundConfig);
    showLoading();
    enterGame();
    exitUser();
}

export enum GameState {
    GAME_INIT,
    SOCKET_CONNECT,
    PLAYER_INIT,
    WORLD_INIT,
    LOAD_PI,
    PI_COMPLETE,
    GAME_CREATE,

}
