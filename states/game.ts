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
        Globals.SoundManager.init(this.game);
        Globals.TickManager.init(this.game);
        if (!GameConfig.isEditor) {
          Globals.Keyboard.init(this.game);
          Globals.MouseMod.init(this.game);
        }
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
            let chatSheet: ISheetResource[] = [{
                key: UI.DropDownBtn.getName(),
                png: UI.DropDownBtn.getPNG(),
                frameWidth: DropDownBtn.getWidth(),
                frameHeight: DropDownBtn.getHeight()
            }
            ];
            let chatAtlas: IAtlasResource[] = [{
                key: UI.Button.getName(),
                png: UI.Button.getPNG(),
                json: UI.Button.getJSON()
            }];
            Globals.ModuleManager.openModule(ModuleTypeEnum.CHAT, {nineslices: chatResource, sheets: chatSheet, atlas: chatAtlas});

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

            let shortcutMenuResource: IImageResource[] = [{
                key: UI.ItemBg.getName(),
                png: UI.ItemBg.getPNG()
            }, {
                key: UI.ItemShortcutBg.getName(),
                png: UI.ItemShortcutBg.getPNG()
            }];
            Globals.ModuleManager.openModule(ModuleTypeEnum.SHORTCUTMENU, {images: shortcutMenuResource});
            let promptResource: INineSliceImageResource[] = [{
                key: UI.WindowBg.getName(),
                png: UI.WindowBg.getPNG(),
                top: 29,
                left: 13,
                right: 13,
                bottom: 7
            }];
            let promtSheet: ISheetResource[] = [{
                key: UI.WindowClose.getName(),
                png: UI.WindowClose.getPNG(),
                frameWidth: WindowClose.getWidth(),
                frameHeight: WindowClose.getHeight()
            }];
            Globals.ModuleManager.openModule(ModuleTypeEnum.PROMPT, {nineslices: promptResource, sheets: promtSheet});
        }

        if (Globals.DataCenter.SceneData.initialize) {
            this.onHandleEnterScene();
        } else {
            Globals.MessageCenter.on(MessageType.SCENE_DATA_INITIALIZE, this.onHandleEnterScene);
        }
    }

    public update(game: Phaser.Game): void {
        super.update(game);
        Globals.TickManager.onTick();
    }

    public render(game: Phaser.Game): void {
         this.game.debug.text(this.game.time.fps.toString(), GameConfig.GameWidth - 20, 14, "#a7aebe");
    }

    private onHandleEnterScene(): void {
        Globals.ModuleManager.openModule(ModuleTypeEnum.SCENE);
    }
}
