import { op_client } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { EventType, ModuleName } from "structure";
import { PicaExploreList } from "./PicaExploreList";
import { PicaGame } from "picaWorker";
import { BaseDataConfigManager } from "../../data";
import { ObjectAssign } from "utils";

export class PicaExploreListMediator extends BasicMediator {
    protected mModel: PicaExploreList;
    protected game: PicaGame;
    constructor(game: PicaGame) {
        super(ModuleName.PICAEXPLORELIST_NAME, game);
        this.mModel = new PicaExploreList(game);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(ModuleName.PICAEXPLORELIST_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.on(ModuleName.PICAEXPLORELIST_NAME + "_queyexplorechapter", this.onChapterResultHandler, this);
        this.game.emitter.on(ModuleName.PICAEXPLORELIST_NAME + "_queyenterroom", this.onEnterRoomHandler, this);
        this.game.emitter.on(ModuleName.PICAEXPLORELIST_NAME + "_retchapterresult", this.onQUERY_CHAPTER_RESULT, this);
    }

    hide() {
        super.hide();
        this.game.emitter.off(ModuleName.PICAEXPLORELIST_NAME + "_hide", this.onHidePanel, this);
        this.game.emitter.off(ModuleName.PICAEXPLORELIST_NAME + "_queyexplorechapter", this.onChapterResultHandler, this);
        this.game.emitter.off(ModuleName.PICAEXPLORELIST_NAME + "_queyenterroom", this.onEnterRoomHandler, this);
        this.game.emitter.off(ModuleName.PICAEXPLORELIST_NAME + "_retchapterresult", this.onQUERY_CHAPTER_RESULT, this);
    }

    protected panelInit() {
        super.panelInit();
        this.setChapters();
    }
    get playerInfo() {
        const info = this.game.user.userData.playerProperty;
        return info;
    }

    private onHidePanel() {
        this.hide();
    }

    private onQUERY_CHAPTER_RESULT(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_CHAPTER_RESULT) {
        this.mShowData = content;
        content["lock"] = this.playerInfo.level.value < content.chapter.requiredPlayerLevel;
        const configManager = <BaseDataConfigManager>this.game.configManager;
        const caphter = configManager.getChapterData(content.chapter.chapterId);
        ObjectAssign.excludeTagAssign(content.chapter, caphter, "exclude");
        for (const level of content.levels) {
            const templevel = configManager.getExploreLevelData(level.levelId);
            ObjectAssign.excludeTagAssign(level, templevel, "exclude");
        }
        if (this.mView) this.mView.setExploreChapterResult(content);
    }

    private onChapterResultHandler(chapterId: number) {
        this.mModel.queryExploreChapter(chapterId);
    }

    private onEnterRoomHandler(roomID: string) {
        this.mModel.query_ENTER_ROOM(roomID);
    }

    private setChapters() {
        const mgr = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        if (mgr) {
            const chapters = mgr.chapters;
            if (this.mView && chapters) {
                this.mView.setExploreChapters(chapters);
                this.mView.setEnergyData(this.playerInfo.energy.value, this.playerInfo.energy.max);
            }
        }
    }
}
