import { UIManager, Game, BasicMediator } from "gamecore";
import { ModuleName } from "structure";
import { ActivityMediator } from "./Activity/ActivityMediator";
import { CutInMediator } from "./CutIn";
import { DialogMediator } from "./Dialog";
import { LoginMediator } from "./login";
import { PicaChatMediator } from "./PicaChat/PicaChatMediator";
import { PicaMainUIMediator } from "./PicaMainUI/PicaMainUIMediator";
export class PicaWorkerUiManager extends UIManager {
    constructor(game: Game) {
        super(game);
        this.mMedMap.set(ModuleName.LOGIN_NAME, new LoginMediator(this.game));
        this.mMedMap.set(ModuleName.DIALOG_NAME, new DialogMediator(this.game));
        this.mMedMap.set(ModuleName.CUTIN_NAME, new CutInMediator(this.game));
        this.mMedMap.set(ModuleName.ACTIVITY_NAME, new ActivityMediator(this.game));
        this.mMedMap.set(ModuleName.PICACHAT_NAME, new PicaChatMediator(this.game));
        this.mMedMap.set(ModuleName.PICAMAINUI_NAME, new PicaMainUIMediator(this.game));
    }

    public showMainUI() {
        super.showMainUI();
    }

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
