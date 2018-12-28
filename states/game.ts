import Globals from "../Globals";
import {ModuleTypeEnum} from "../base/module/base/ModuleType";
import {MessageType} from "../common/const/MessageType";
import {UI} from "../Assets";
import {IAtlasResource, INineSliceImageResource} from "../interface/IPhaserLoadList";
import {GameConfig} from "../GameConfig";

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
        Globals.MouseMod.init(this.game);
        Globals.LayerManager.init(this.game);
        Globals.LayoutManager.init(this.game);

        if (!GameConfig.isEditor) {
            let chatResource: INineSliceImageResource[] = [{
                key: UI.DialogBg.getName(),
                png: UI.DialogBg.getPNG(),
                top: 7,
                left: 7,
                right: 7,
                bottom: 7
            },
                {key: UI.InputBg.getName(), png: UI.InputBg.getPNG(), top: 4, left: 2, right: 2, bottom: 4}
            ];
            let atlas: IAtlasResource[] = [{
                key: UI.Button.getName(),
                png: UI.Button.getPNG(),
                json: UI.Button.getJSON()
            }]
            Globals.ModuleManager.openModule(ModuleTypeEnum.CHAT, {nineslices: chatResource, atlas: atlas});

            let roleInfoResource: INineSliceImageResource[] = [{
                key: UI.ProgressBg.getName(),
                png: UI.ProgressBg.getPNG(),
                top: 6,
                left: 6,
                right: 6,
                bottom: 6
            },
                {key: UI.ProgressFill.getName(), png: UI.ProgressFill.getPNG(), top: 6, left: 6, right: 6, bottom: 6}
            ];
            Globals.ModuleManager.openModule(ModuleTypeEnum.ROLEINFO, {nineslices: roleInfoResource});
        }

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
        this.game.debug.text(this.game.time.fps.toString(), GameConfig.GameWidth - 20, 14, "#a7aebe");
        // this.game.debug.text(this.game.world.width+"|"+this.game.world.height+"|"+this.game.time.fps.toString(), 2, 14, '#a7aebe');
        // this.game.debug.cameraInfo(this.game.camera, 2, 32, '#a7aebe');
    }

    private onHandleEnterScene(): void {
        Globals.ModuleManager.openModule(ModuleTypeEnum.SCENE);
    }
}
