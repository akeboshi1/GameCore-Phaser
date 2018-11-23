import "p2";
import "pixi";
import "phaser";
import "isometric";
import "dragonBones";
import IGame from "./interface/IGame";
import IGameParam from "./interface/IGameParam";
import "phaser-ce";
import BootState from "./states/boot";
import Globals from "./Globals";
import PreloaderState from "./states/preloader";
import GameState from "./states/game";
import {MessageType} from "./common/const/MessageType";
import {IEditorMode} from "./interface/IEditorMode";
import {GameConfig} from "./GameConfig";
import SelectRole from "./states/selectrole";

export default class Game extends Phaser.Game implements IGame {
    private sceneReady: boolean;
    constructor(value: IGameParam) {
        let config: Phaser.IGameConfig = {
            width: value.width,
            height: value.height,
            renderer: Phaser.AUTO,
            parent: "game",
            resolution: 1,
        };
        super(config);

        // 初始化地图数据
        GameConfig.isEditor = value.isEditor;
        Globals.SocketCenter.setSocketSend(value.iSocketSend);
        Globals.SocketCenter.setSocketHandle(value.iSocketHandle);
        Globals.ServiceCenter.register();

        // Globals.DataCenter.EditorData.setMapInfo(value.mapData);
        // Globals.DataCenter.MapData.setMapInfo(value.mapData);

        this.state.add("boot", BootState);
        this.state.add("preloader", PreloaderState);
        this.state.add("selectrole", SelectRole);
        this.state.add("game", GameState);

        this.state.start("boot");

        Globals.MessageCenter.once(MessageType.SCENE_INITIALIZED, this.handleSceneReady);
    }

    /**
     * 告诉我你好了
     */
    private handleSceneReady(): void {
        this.sceneReady = true;
    }

    public resize(): void {
        Globals.MessageCenter.emit(MessageType.CLIENT_RESIZE);
    }

    public setEditorMode(mode: IEditorMode) {
        Globals.DataCenter.EditorData.changeEditorMode(mode);
        Globals.MessageCenter.emit(MessageType.EDITOR_CHANGE_MODE);
    }
}