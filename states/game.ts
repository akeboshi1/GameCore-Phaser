import Globals from "../Globals";
import {ModuleTypeEnum} from "../base/module/base/ModuleType";
import {MessageType} from "../common/const/MessageType";
import {GameConfig} from "../GameConfig";
import {LoaderManager} from "../common/manager/LoaderManager";

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
}
