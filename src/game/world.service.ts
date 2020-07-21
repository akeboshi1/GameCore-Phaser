// World 作为所有模组的全局服务，Hold所有管理对象
import { IRoomManager, IRoomService, Clock } from "../rooms";
import { Size } from "../utils";
// import { IElementStorage } from "./element.storage";
import { UiManager } from "../ui";
import { InputManager } from "./input.service";
import { Account } from "./Account";
import { HttpService } from "../net";
// import { ILauncherConfig } from "../../launcher";
import { MouseManager } from "./mouse.manager";
import { ConnectionService } from "../net";
import { ISoundConfig } from "./sound.manager";
import { PluginManager } from "../plugins";

export interface WorldService {
    connection: ConnectionService;
    clock: Clock;
    moveStyle: number;
    orientation: number;
    readonly game: Phaser.Game;
    readonly roomManager: IRoomManager;
    readonly elementStorage: any;
    readonly uiManager: UiManager;
    readonly inputManager: InputManager;
    readonly mouseManager: MouseManager;
    readonly httpService: HttpService;
    readonly uiScale: number;
    readonly scaleRatio: number;
    readonly uiRatio: number;
    readonly account: Account;
    readonly modulePath: string;
    readonly emitter: Phaser.Events.EventEmitter;
    readonly pluginManager: PluginManager;

    reconnect();
    startHeartBeat();
    changeScene();
    getSize(): Size;
    getConfig(): any;
    getModuleRootPath(): string;
    getModulePath(name: string): string;
    getGameConfig(): Phaser.Types.Core.GameConfig;
    onFocus();
    onBlur();

    changeRoom(room: IRoomService);

    startFullscreen();
    stopFullscreen();

    closeGame();

    loadSceneConfig(sceneId: string): Promise<any>;

    playSound(config: ISoundConfig);
    showLoading();
}
