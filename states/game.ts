import Globals from "../Globals";
import {ModuleTypeEnum} from "../base/module/base/ModuleType";
import {MessageType} from "../common/const/MessageType";
import {GameConfig} from "../GameConfig";
import {LoaderManager} from "../common/manager/LoaderManager";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world, op_def } from "pixelpai_proto";
import { Log } from "../Log";

export default class Game extends Phaser.State {

    public init(): void {
        this.game.time.advancedTiming = true;
    }

    public create(): void {
        Globals.SoundManager.init(this.game);
        Globals.TickManager.init(this.game);
        Globals.TimeManager.init();
        Globals.LayerManager.init(this.game);
        Globals.LayoutManager.init(this.game);
        Globals.DragManager.init(this.game);
        Globals.LoaderManager.init(this.game);
        if (!GameConfig.isEditor) {
            Globals.Keyboard.init(this.game);
            Globals.MouseMod.init(this.game);

            // this.game.onBlur.add(this.onBlurHandl, this);
            // this.game.onFocus.add(this.onFocusHandl, this);
        }

        if (!GameConfig.isEditor) {
            Globals.ModuleManager.openModule(ModuleTypeEnum.NOTICE);
            Globals.ModuleManager.openModule(ModuleTypeEnum.CHAT);
            Globals.ModuleManager.openModule(ModuleTypeEnum.ROLEINFO);
            Globals.ModuleManager.openModule(ModuleTypeEnum.SHORTCUTMENU);
            Globals.ModuleManager.openModule(ModuleTypeEnum.PROMPT);
        } else {
            Globals.ModuleManager.openModule(ModuleTypeEnum.MINIMAP);
        }

        if (Globals.DataCenter.SceneData.initialize) {
            this.onHandleEnterScene();
        } else {
            Globals.MessageCenter.on(MessageType.SCENE_DATA_INITIALIZE, this.onHandleEnterScene, this);
        }
    }

    public update(game: Phaser.Game): void {
        Globals.TickManager.onTick();
    }

    public preRender(): void {
        Globals.TickManager.onRender();
    }

    public render(game: Phaser.Game): void {
         this.game.debug.text(this.game.time.fps.toString(), GameConfig.GameWidth - 20, 14, "#a7aebe");
    }

    private onHandleEnterScene(): void {
        Globals.MessageCenter.cancel(MessageType.SCENE_DATA_INITIALIZE, this.onHandleEnterScene, this);
        Globals.ModuleManager.openModule(ModuleTypeEnum.SCENE);
    }

    private onFocusHandl() {
        Log.trace("onFocus");
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
        let context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
        context.gameStatus = op_def.GameStatus.Focus;
        Globals.SocketManager.send(pkt);
    }

    private onBlurHandl() {
        Log.trace("onBlur");
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
        let context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS = pkt.content;
        context.gameStatus = op_def.GameStatus.Blur;
        Globals.SocketManager.send(pkt);
    }
}
