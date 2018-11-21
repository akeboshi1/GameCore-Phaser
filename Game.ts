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
import {EditorData} from "./common/data/EditorData";

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
        console.log(value);

        // 初始化地图数据
        Globals.isEditor = true; // value.isEditor;
        Globals.DataCenter.EditorData.setEditorMode(value.editorMode);
        Globals.DataCenter.MapData.setMapInfo(value.mapData);

        this.state.add("boot", BootState);
        this.state.add("preloader", PreloaderState);
        this.state.add("game", GameState);

        this.state.start("boot");
        Globals.MessageCenter.once(MessageType.SCENE_INITIALIZED, this.handleSceneReady );
    }

    private handleSceneReady(): void {
        this.sceneReady = true;
    }

    public resize(): void {
        Globals.MessageCenter.emit(MessageType.CLIENT_RESIZE);
    }

    public changeEditorMode(mode: IEditorMode) {
        Globals.DataCenter.EditorData.changeEditorMode(mode);
        Globals.MessageCenter.emit(MessageType.EDITOR_CHANGE_MODE);
    }
}