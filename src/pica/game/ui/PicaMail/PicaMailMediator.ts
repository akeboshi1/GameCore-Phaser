import { BasicMediator, Game } from "gamecore";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";
import { BaseDataConfigManager } from "../../config";
import { PicaTask } from "./PicaMail";
export class PicaMailMediator extends BasicMediator {
    protected mModel: PicaTask;
    protected mailDatas: any;
    constructor(game: Game) {
        super(ModuleName.PICAMAIL_NAME, game);
        this.mModel = new PicaTask(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAMAIL_NAME + "_hide", this.onHideView, this);
        this.game.emitter.on(ModuleName.PICAMAIL_NAME + "_readmail", this.onQueryReadMail, this);
        this.game.emitter.on(ModuleName.PICAMAIL_NAME + "_getrewards", this.onQueryMailReward, this);
        this.game.emitter.on(ModuleName.PICAMAIL_NAME + "_allrewards", this.onQueryAllMailRewards, this);
        this.game.emitter.on(ModuleName.PICAMAIL_NAME + "_retmaillist", this.onRetQuestMailDatas, this);
    }

    hide() {
        if (!this.mView) this.mView = this.game.peer.render[ModuleName.PICAMAIL_NAME];
        super.hide();
        this.game.emitter.off(ModuleName.PICAMAIL_NAME + "_hide", this.onHideView, this);
        this.game.emitter.off(ModuleName.PICAMAIL_NAME + "_readmail", this.onQueryReadMail, this);
        this.game.emitter.off(ModuleName.PICAMAIL_NAME + "_getrewards", this.onQueryMailReward, this);
        this.game.emitter.off(ModuleName.PICAMAIL_NAME + "_allrewards", this.onQueryAllMailRewards, this);
        this.game.emitter.off(ModuleName.PICAMAIL_NAME + "_retmaillist", this.onRetQuestMailDatas, this);
    }
    panelInit() {
        super.panelInit();
        this.queryMailList();
    }
    private onHideView() {
        this.hide();
    }

    private onQueryMailReward(id: string) {
        this.mModel.queryGetTargetMail(id);
    }
    private onQueryReadMail(id: string) {
        this.mModel.queryReadMail(id);
    }

    private onQueryAllMailRewards() {
        this.mModel.queryGetAllRewards();
    }
    private queryMailList() {
        this.mModel.queryMailList();
    }

    private onRetQuestMailDatas(content: any) {
        const list = content.list;
        const configMgr = <BaseDataConfigManager>this.game.configManager;
        for (const temp of list) {
            if (temp.attachments) {
                configMgr.getBatchItemDatas(temp.attachments);
            }
            temp["servicetime"] = Math.floor(this.game.clock.unixTime / 1000);
        }
        this.mView.setMailDatas(content);
    }
}
