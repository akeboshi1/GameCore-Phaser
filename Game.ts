import "p2";
import "pixi";
import "phaser";
import "phaser-ce";
import "isometric";
import "dragonBones";
import "nineslice";
import "input";
import IGame from "./interface/IGame";
import IGameParam from "./interface/IGameParam";
import BootState from "./states/boot";
import Globals from "./Globals";
import PreloaderState from "./states/preloader";
import GameState from "./states/game";
import {MessageType} from "./common/const/MessageType";
import {GameConfig} from "./GameConfig";
import SelectRole from "./states/selectrole";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world} from "../protocol/protocols";
import {IRectangle} from "./base/ds/IRectangle";
import {Log} from "./Log";

export default class Game extends Phaser.Game implements IGame {
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
        if (value.isEditor) {
            Globals.DataCenter.EditorData.setEditorMode({mode: value.editorMode.mode, type: value.editorMode.type});
        }

        GameConfig.preLoadList = value.preLoadList;
        GameConfig.GameWidth = value.width;
        GameConfig.GameHeight = value.height;
        GameConfig.HomeDir = value.homeDir;

        dragonBones.PhaserFactory.init(this);
        Globals.SocketManager.setSocketConnection(value.iSocketConnection);
        Globals.ServiceCenter.register();

        this.state.add("boot", BootState);
        this.state.add("preloader", PreloaderState);
        this.state.add("selectrole", SelectRole);
        this.state.add("game", GameState);

        this.state.start("boot", false, false, value.preLoadList);

        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_GAME_CREATED);
        Globals.SocketManager.send(pkt);
    }

    public resize(bounds: IRectangle): void {
        GameConfig.GameWidth = bounds.width;
        GameConfig.GameHeight = bounds.height;
        this.scale.setGameSize(bounds.width, bounds.height);
        // Log.trace(this.camera.x, this.camera.y);
        Globals.MessageCenter.emit(MessageType.CLIENT_RESIZE);
    }

    public updateLogic(timeStep: number): void {
        super.updateLogic(timeStep);
        // 0.01666
        dragonBones.PhaserFactory.factory.dragonBones.advanceTime(-1);
        Globals.TickManager.onTick(timeStep * 1000);
    }

    public updateRender(elapsedTime: number): void {
        super.updateRender(elapsedTime);
        Globals.TickManager.onFrame();
    }

    public dispose(): void {
        Globals.ServiceCenter.dispose();
        Globals.ModuleManager.dispose();
        Globals.SoundManager.dispose();
        Globals.Keyboard.dispose();
        Globals.MouseMod.dispose();
        Globals.TickManager.dispose();
        Globals.SceneManager.dispose();
        Globals.DataCenter.dispose();
        Globals.MessageCenter.dispose();
        Globals.LayerManager.dispose();
        Globals.SocketManager.dispose();
        Globals.ObjectPoolManager.dispose();
        this.state.destroy();
        this.destroy();
    }
}
