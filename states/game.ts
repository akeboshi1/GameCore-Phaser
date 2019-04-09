import Globals from "../Globals";
import {ModuleTypeEnum} from "../base/module/base/ModuleType";
import {MessageType} from "../common/const/MessageType";
import {UI} from "../Assets";
import {IAtlasResource, IImageResource, INineSliceImageResource, ISheetResource} from "../interface/IPhaserLoadList";
import {GameConfig} from "../GameConfig";
import WindowClose = UI.WindowClose;
import DropDownBtn = UI.DropDownBtn;
import {Log} from "../Log";

export default class Game extends Phaser.State {

    public init(): void {
        this.game.time.advancedTiming = true;
    }

    public create(): void {
        this.tempNow = new Date().getTime();
        Globals.DataCenter.setServerTime(this.tempNow);
        Globals.SoundManager.init(this.game);
        Globals.TickManager.init(this.game);
        if (!GameConfig.isEditor) {
          Globals.Keyboard.init(this.game);
          Globals.MouseMod.init(this.game);
        }
        Globals.LayerManager.init(this.game);
        Globals.LayoutManager.init(this.game);
        Globals.DragManager.init(this.game);
        dragonBones.PhaserFactory.init(this.game);

        if (!GameConfig.isEditor) {
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

    private tempNow = 0;
    public update(game: Phaser.Game): void {
        let now = new Date().getTime();
        dragonBones.PhaserFactory.factory.dragonBones.advanceTime((now - this.tempNow) / 1000);
        this.tempNow = now;
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
