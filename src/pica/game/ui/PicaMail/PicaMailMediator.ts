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
            if (temp.attachments ) {
                configMgr.getBatchItemDatas(temp.attachments );
            }
        }
        this.mView.setMailDatas(content);
    }

    private getTestMails() {
        const temp = {
            name: "来自皮卡堂系统的邮件", sender: "皮卡堂运营组", time: 1618299757, end: 1628300000, content:
                "亲爱的皮卡堂用户：\n" +
                "皮卡堂维护已经结束，停服期间给您带来的不便，我们深表歉意，每位皮卡堂用户都可以在邮箱里领取600金币以及xx时装一套和xx时装一套的停服补偿。\n" +
                "感谢您的理解和支持！",
            rewards: [{ id: "IA0000127", count: 50 }, { id: "IA0000176", count: 50 }, { id: "IA0000257", count: 50 }, { id: "IA0000309", count: 50 }, { id: "IF0000926", count: 50 }, { id: "IF0000989", count: 50 },
            { id: "IF0000957", count: 50 }, { id: "IF0000946", count: 50 }, { id: "IF0000942", count: 50 }, { id: "IF0000925", count: 50 }]
        };
        const temps = [temp];
        for (let i = 0; i < 100; i++) {
            temps.push(temp);
        }
        return temps;
    }
}
