// World 作为所有模组的全局服务，Hold所有管理对象
import { Size } from "./core/utils/size";
import { IRoomService } from "../rooms/room";
import { IElementStorage } from "./element.storage";
import { UiManager } from "./ui/ui.manager";
import { InputManager } from "./core/render/manager/input.manager";
import { ILauncherConfig } from "../../launcher";
import { MouseManager } from "./mouse.manager";
import { Render } from "./core/render/render";
import { HttpService } from "../logic/http.service";

export interface WorldService {
    orientation: number;
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
    render(): Render;
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
