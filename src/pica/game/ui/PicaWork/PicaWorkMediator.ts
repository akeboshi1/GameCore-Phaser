import { op_client } from "pixelpai_proto";
import { PicaWork } from "./PicaWork";
import { BasicMediator, Game, PlayerProperty, UIType } from "gamecore";
import { EventType, ModuleName } from "structure";
export class PicaWorkMediator extends BasicMediator {
    protected mModel: PicaWork;
    private mPlayerInfo: PlayerProperty;
    constructor(game: Game) {
        super(ModuleName.PICAWORK_NAME, game);
        this.mModel = new PicaWork(game);
        this.mUIType = UIType.Scene;
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAWORK_NAME + "_questlist", this.query_WORK_LIST, this);
        this.game.emitter.on(ModuleName.PICAWORK_NAME + "_questwork", this.query_WORK_ON_JOB, this);
        this.game.emitter.on(ModuleName.PICAWORK_NAME + "_hide", this.onHideView, this);

        this.game.emitter.on(ModuleName.PICAWORK_NAME + "_retquestlist", this.on_Work_LIST, this);
        this.game.emitter.on(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
        this.game.emitter.on(ModuleName.PICAWORK_NAME + "_initialized", this.onViewInitComplete, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAWORK_NAME + "_questlist", this.query_WORK_LIST, this);
        this.game.emitter.off(ModuleName.PICAWORK_NAME + "_questwork", this.query_WORK_ON_JOB, this);
        this.game.emitter.off(ModuleName.PICAWORK_NAME + "_hide", this.onHideView, this);

        this.game.emitter.off(ModuleName.PICAWORK_NAME + "_retquestlist", this.on_Work_LIST, this);
        this.game.emitter.off(EventType.UPDATE_PLAYER_INFO, this.onUpdatePlayerInfo, this);
        this.game.emitter.off(ModuleName.PICAWORK_NAME + "_initialized", this.onViewInitComplete, this);
    }

    destroy() {
        this.mPlayerInfo = undefined;
        super.destroy();
    }

    get playerInfo() {
        if (!this.mPlayerInfo) this.mPlayerInfo = this.game.user.userData.playerProperty;
        return this.mPlayerInfo;
    }
    private query_WORK_LIST() {
        this.mModel.query_JOB_LIST();
    }

    private query_WORK_ON_JOB(id: string) {
        this.mModel.query_WORK_ON_JOB(id);
    }

    private on_Work_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST) {
        const questData = this.checkCanDoJob(content);
        this.mView.setWorkData(questData);
        this.onUpdatePlayerInfo(this.playerInfo);
    }
    private onUpdatePlayerInfo(content: PlayerProperty) {
        this.mPlayerInfo = content;
        if (this.mView)
            this.mView.setWorkChance(content.workChance.value);
    }
    private checkCanDoJob(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_JOB_LIST) {
        const jobs: op_client.IPKT_Quest[] = [];
        for (const job of content.jobs) {
            const targets = job.targets;
            let issatisfy: boolean = true;
            for (const target of targets) {
                const property = this.playerInfo.getProperty(target.id);
                if (target.neededCount > property.value) {
                    issatisfy = false;
                    break;
                }
            }
            if (issatisfy) jobs.push(job);
        }
        jobs.sort((a, b) => {
            if (a.cabinType > b.cabinType) return -1;
            else return 1;
        });
        return jobs[0];
    }
    private onHideView() {
        const uimanager = this.game.uiManager;
        uimanager.showMed(ModuleName.BOTTOM);
        this.destroy();
    }
    private onViewInitComplete() {
        const uimanager = this.game.uiManager;
        uimanager.hideMed(ModuleName.BOTTOM);
    }
}
