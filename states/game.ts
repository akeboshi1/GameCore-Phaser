import Globals from "../Globals";
import {ModuleTypeEnum} from "../base/module/base/ModuleType";
import {MessageType} from "../common/const/MessageType";

export default class Game extends Phaser.State {

    public init(): void {
        this.game.time.advancedTiming = true;
        // Globals.game.iso.anchor.setTo(0.5, 0);
    }

    public create(): void {
        dragonBones.PhaserFactory.init(this.game);
        Globals.SoundManager.init(this.game);
        Globals.TickManager.init(this.game);
        Globals.Keyboard.init(this.game);
        Globals.LayerManager.init(this.game);
        Globals.LayoutManager.init(this.game);

        Globals.ModuleManager.openModule(ModuleTypeEnum.MAINMENU);

        if (Globals.DataCenter.SceneData.initialize) {
            this.onHandleEnterScene();
        } else {
            Globals.MessageCenter.on(MessageType.SCENE_DATA_INITIALIZE, this.onHandleEnterScene);
        }
    }

    public render(game: Phaser.Game): void {
        // Log.trace("render---->>>", this.game.time.now);
        Globals.TickManager.onEnterFrame();
        dragonBones.PhaserFactory.factory.dragonBones.advanceTime(-1.0);
        this.game.debug.text(this.game.time.fps.toString(), 2, 14, "#a7aebe");
        // this.game.debug.text(this.game.world.width+"|"+this.game.world.height+"|"+this.game.time.fps.toString(), 2, 14, '#a7aebe');
        // this.game.debug.cameraInfo(this.game.camera, 2, 32, '#a7aebe');
    }

    private onHandleEnterScene(): void {
        Globals.ModuleManager.openModule(ModuleTypeEnum.SCENE);
    }
}
