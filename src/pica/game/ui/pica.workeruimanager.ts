import { UIManager, Game, BasicMediator } from "gamecore";
import { ModuleName } from "structure";
import { CutInMediator } from "./CutIn";
import { DialogMediator } from "./Dialog";
import { LoginMediator } from "./Login";
import { BottomMediator } from "./Bottom/BottomMediator";
import { PicaDecorateMediator } from "./PicaDecorate/PicaDecorateMediator";
import { PicaDecorateControlMediator } from "./PicaDecorateControl/PicaDecorateControlMediator";
import { PicaFurniFunMediator } from "./PicaFurniFun/PicaFurniFunMediator";
import { PicaNewMainMediator } from "./PicaNewMain/PicaNewMainMediator";
export class PicaWorkerUiManager extends UIManager {
    constructor(game: Game) {
        super(game);
    }

    public showMainUI(hideNames?: string[]) {
        this.clearMediator();
        this.mMedMap.set(ModuleName.LOGIN_NAME, new LoginMediator(this.game));
        this.mMedMap.set(ModuleName.DIALOG_NAME, new DialogMediator(this.game));
        this.mMedMap.set(ModuleName.CUTIN_NAME, new CutInMediator(this.game));
        // this.mMedMap.set(ModuleName.ACTIVITY_NAME, new ActivityMediator(this.game));
        // this.mMedMap.set(ModuleName.PICACHAT_NAME, new PicaChatMediator(this.game));
        this.mMedMap.set(ModuleName.BOTTOM, new BottomMediator(this.game));
        // this.mMedMap.set(ModuleName.PICAMAINUI_NAME, new PicaMainUIMediator(this.game));
        this.mMedMap.set(ModuleName.PICANEWMAIN_NAME, new PicaNewMainMediator(this.game));

        this.mMedMap.set(ModuleName.PICAFURNIFUN_NAME, new PicaFurniFunMediator(this.game)); // 这个的确要弄成全局的..

        super.showMainUI(hideNames);
    }

    // public showDecorateUI() {
    //     this.clearMediator();
    //     this.mMedMap.set(ModuleName.PICADECORATECONTROL_NAME, new PicaDecorateControlMediator(this.game));
    //     this.mMedMap.set(ModuleName.PICADECORATE_NAME, new PicaDecorateMediator(this.game));
    //     super.showDecorateUI();
    //     // this.mMedMap.set(UIMediatorType.NOTICE, new NoticeMediator(this.mUILayerManager, this.mScene, this.worldService));
    // }

    public showMed(type: string, param: any) {
        if (!this.mMedMap) {
            this.mMedMap = new Map();
        }
        type = this.getPanelNameByAlias(type);
        const className: string = type + "Mediator";
        let mediator: BasicMediator = this.mMedMap.get(type);
        if (!mediator) {
            // const path: string = `./${type}/${type}Mediator`;
            let ns: any = require(`./${type}/${className}`);
            if (!ns) {
                ns = this.getMediatorClass(type);
            }
            mediator = new ns[className](this.game);
            if (!mediator) {
                super.showMed(type, param);
                // Logger.getInstance().error(`error ${type} no panel can show!!!`);
                return;
            }
            this.mMedMap.set(type, mediator);
            // mediator.setName(type);
        }
        // if (mediator.showing) return;
        if (param) mediator.setParam(param);
        if (mediator.isShow()) return;
        mediator.show(param);
    }
}
