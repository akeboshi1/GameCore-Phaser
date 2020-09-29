// World 作为所有模组的全局服务，Hold所有管理对象
import { HttpService } from "../logic/http.service";
import { IElementStorage } from "./element.storage";
import { UiManager } from "./ui/Ui.manager";
import { InputManager } from "./manager/input.manager";
import { MouseManager } from "./manager/mouse.manager";
import { Render } from "./render";
import { Size } from "../../utils/size";
import { ILauncherConfig } from "../../../launcher";
import { IRoomService } from "./rooms/room";

export interface WorldService {
    orientation: number;
    render: Render;
    readonly game: Phaser.Game;
    readonly elementStorage: IElementStorage;
    readonly uiManager: UiManager;
    readonly inputManager: InputManager;
    readonly mouseManager: MouseManager;
    readonly httpService: HttpService;
    readonly uiScale: number;
    readonly scaleRatio: number;
    readonly uiRatio: number;
    readonly account: Account;
    readonly emitter: Phaser.Events.EventEmitter;
    reconnect();
    changeScene();
    getSize(): Size;
    getConfig(): ILauncherConfig;
    getGameConfig(): Phaser.Types.Core.GameConfig;
    onFocus();
    onBlur();
    setKeyBoardHeight(height: number);
    changeRoom(room: IRoomService);
    enterVirtualWorld();
    startFullscreen();
    stopFullscreen();

    closeGame();

    loadSceneConfig(sceneId: string): Promise<any>;

    playSound(config: any);
    showLoading();
    enterGame();
    exitUser();
}

export enum GameState {
    NONE,
    GAME_INIT,
    SOCKET_CONNECT,
    LOGIN,
    PLAYER_INIT,
    WORLD_INIT,
    LOAD_PI,
    PI_COMPLETE,
    DECODE_PI,
    GAME_CREATE,
    CHARACTER_CREATED,
    ENTER_SCENE,
    SCENE_CREATE,
    PAUSE,
    PLAYING,
    SOCKET_DISCONNECT,
    SOCKET_ERROR,
}
