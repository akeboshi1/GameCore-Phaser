import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { EventType, ModuleName } from "structure";
import { BaseDataConfigManager, GalleryConfig, GalleryType } from "../../config";
import { PicaNewIllustrated } from "./PicaNewIllustrated";
import { IGalleryCombination, IGalleryLevel, IGalleryLevelGroup, IGalleryCollection, IUpdateGalleryDatas, MainUIRedType, RedEventType } from "../../../structure";
import { PicaGame } from "../../pica.game";
import { PicaCommandMsgType } from "../../command/pica.command.msg.type";
import { ObjectAssign } from "utils";
export class PicaNewIllustratedMediator extends BasicMediator {
    protected mModel: PicaNewIllustrated;
    private mScneType: op_def.SceneTypeEnum;
    constructor(game: Game) {
        super(ModuleName.PICAILLUSTRATED_NEW_NAME, game);
        this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        this.mModel = new PicaNewIllustrated(game, this.mScneType);
    }

    onEnable() {
        this.proto.on("GALLERY_LEVELREWARD_TAKENLIST", this.onBadgeLevelRewardsHandler, this);
        this.proto.on("GALLERY_EXPREWARD_TAKENLIST", this.onLevelExpRewardsHandler, this);
        this.proto.on("GALLERY_COLLECTIONRWARD_TAKENLIST", this.onHasGotCollectRewardsHandler, this);
        this.proto.on("GALLERY_COLLECTIONREWARD_LISTS", this.onDisplayCollectRewardsHandler, this);
    }

    onDisable() {
        this.proto.off("GALLERY_LEVELREWARD_TAKENLIST", this.onBadgeLevelRewardsHandler, this);
        this.proto.off("GALLERY_EXPREWARD_TAKENLIST", this.onLevelExpRewardsHandler, this);
        this.proto.off("GALLERY_COLLECTIONRWARD_TAKENLIST", this.onHasGotCollectRewardsHandler, this);
        this.proto.off("GALLERY_COLLECTIONREWARD_LISTS", this.onDisplayCollectRewardsHandler, this);
    }
    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_getbadgerewards", this.getBadgeLevelReward, this);
        this.game.emitter.on(this.key + "_getgalleryexprewards", this.getGalleryExpReward, this);
        this.game.emitter.on(this.key + "_getallgalleryrewards", this.getAllGalleryExpReward, this);
        this.game.emitter.on(this.key + "_getgatheringrewards", this.takeGalleryGatheringReward, this);
        this.game.emitter.on(this.key + "_getgallerylightrewards", this.getItemGalleryLightReward, this);
        this.game.emitter.on(this.key + "_changeGalleryStatus", this.changeGalleryStatus, this);
        this.game.emitter.on(this.key + "_getbadgerewards", this.sendLevelRewardTakenList, this);
        this.game.emitter.on(this.key + "_getlevelexprewards", this.sendExpRewardTakenList, this);
        this.game.emitter.on(this.key + "_getcollectedrewards", this.sendCollectionRewardTakenList, this);
        this.game.emitter.on(this.key + "_getdisplatcollectedlist", this.sendDisplayCollectionList, this);
        this.game.emitter.on(this.key + "_openpanel", this.onShowPanelHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(RedEventType.GALLERY_PANEL_RED, this.onRedSystemHandler, this);
        this.game.emitter.on(PicaCommandMsgType.PicaUpdateGalleryDatas, this.onUpdateGalleryDatasHandler, this);

    }

    hide() {
        this.game.emitter.off(this.key + "_getbadgerewards", this.getBadgeLevelReward, this);
        this.game.emitter.off(this.key + "_getgalleryexprewards", this.getGalleryExpReward, this);
        this.game.emitter.off(this.key + "_getallgalleryrewards", this.getAllGalleryExpReward, this);
        this.game.emitter.off(this.key + "_getgatheringrewards", this.takeGalleryGatheringReward, this);
        this.game.emitter.off(this.key + "_getgallerylightrewards", this.getItemGalleryLightReward, this);
        this.game.emitter.off(this.key + "_changeGalleryStatus", this.changeGalleryStatus, this);
        this.game.emitter.off(this.key + "_getbadgerewards", this.sendLevelRewardTakenList, this);
        this.game.emitter.off(this.key + "_getlevelexprewards", this.sendExpRewardTakenList, this);
        this.game.emitter.off(this.key + "_getcollectedrewards", this.sendCollectionRewardTakenList, this);
        this.game.emitter.off(this.key + "_getdisplatcollectedlist", this.sendDisplayCollectionList, this);
        this.game.emitter.off(this.key + "_openpanel", this.onShowPanelHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(RedEventType.GALLERY_PANEL_RED, this.onRedSystemHandler, this);
        this.game.emitter.off(PicaCommandMsgType.PicaUpdateGalleryDatas, this.onUpdateGalleryDatasHandler, this);
        super.hide();
    }

    destroy() {
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        this.setGallaryData();
        if (this.mView) this.mView.setRedsState(this.getRedSystem());
    }

    private onCloseHandler() {
        this.hide();
    }

    /**
     * 获取徽章奖励
     * @param id
     */
    private getBadgeLevelReward(id: number) {
        this.game.sendCustomProto("INT", "galleryFacade:getBadgeLevelReward", { count: id });
    }
    /**
     * 获取进度经验奖励
     * @param id
     */
    private getGalleryExpReward(id: number) {
        this.game.sendCustomProto("INT", "galleryFacade:getGalleryExpReward", { count: id });
    }

    private getAllGalleryExpReward(id: number) {
        this.game.sendCustomProto("INT", "galleryFacade:getAllGalleryRewards", {});
    }

    /**
     * 获取收集套装奖励
     * @param id
     */
    private takeGalleryGatheringReward(data: { id: number, indexed: number }) {
        this.game.sendCustomProto("INT_LIST", "galleryFacade:takeGalleryGatheringReward", [data.id, data.indexed]);
    }

    /**
     * 获取图鉴点亮奖励
     * @param id
     */
    private getItemGalleryLightReward(id: string) {
        this.game.sendCustomProto("STRING", "galleryFacade:getItemCollectReward", { id });
    }

    /**
     * 切换图鉴状态
     */
    private changeGalleryStatus(id: string) {
        this.game.sendCustomProto("STRING", "galleryFacade:changeGalleryStatus", { id });
    }

    /**
     * 获取徽章等级奖励
     */
    private sendLevelRewardTakenList() {
        this.game.sendCustomProto("STRING", "galleryFacade:sendLevelRewardTakenList", {});
    }

    /**
     * 获取图鉴经验等级奖励
     */
    private sendExpRewardTakenList() {
        this.game.sendCustomProto("STRING", "galleryFacade:sendExpRewardTakenList", {});
    }

    /**
     * 获取已经领取收集套装数据
     */
    private sendCollectionRewardTakenList() {
        this.game.sendCustomProto("STRING", "galleryFacade:sendCollectionRewardTakenList", {});
    }

    private sendDisplayCollectionList() {
        this.game.sendCustomProto("STRING", "galleryFacade:sendGalleryCollectionShownList", {});
    }
    private onBadgeLevelRewardsHandler(proto: any) {
        const content = proto.content;
        const badgeIds = content.levelIds;
        const badgeMap = this.config.getGalleryMap(GalleryType.galleryLevel);
        const gallery: IUpdateGalleryDatas = this.gallery;
        badgeMap.forEach((value, key) => {
            const temp = <IGalleryLevel>value;
            if (badgeIds.indexOf(temp.id) !== -1) {
                temp.received = 3;
            } else {
                if (gallery.badgeExp >= temp.exp) {
                    temp.received = 2;
                } else {
                    temp.received = 1;
                }
            }
        });
    }

    private onLevelExpRewardsHandler(proto: any) {
        const content = proto.content;
        const expIds: number[] = content.expIds;
        const group = this.getLevelGroup();
        const gallery: IUpdateGalleryDatas = this.gallery;
        group.forEach((value: IGalleryLevelGroup, key: number) => {
            if (value.gallery) {
                value.gallery.forEach((temp) => {
                    if (expIds.indexOf(temp.id) !== -1) {
                        temp.received = 3;
                    } else {
                        if (gallery.galleryExp >= temp.exp) {
                            temp.received = 2;
                            value.rewards = true;
                        } else {
                            temp.received = 1;
                        }
                    }
                });
                value.progress = gallery.galleryExp;
            }
        });
        const groupArr = Array.from(group.values());
        if (this.mView) this.mView.setLevelGalleryGroups(groupArr);
    }

    private onHasGotCollectRewardsHandler(proto: any) {
        const content = proto.content;
        const ids: IGalleryCollection[] = content.collectionIds;
        const temps = this.getCollectCombinations(ids);

    }

    private onDisplayCollectRewardsHandler(proto: any) {
        const content = proto.content;
        const ids: IGalleryCollection[] = content.shownRewards;
        const temps = this.getCollectCombinations(ids);
        if (this.mView) this.mView.setDisplayCollectDatas(temps);
    }

    private onUpdateGalleryDatasHandler(Data: any) {
        this.setGallaryData();
    }
    private setGallaryData() {
        this.mShowData = this.gallery;
        if (!this.mPanelInit) return;
        const tempData: IUpdateGalleryDatas = this.gallery;
        this.sortGallery(tempData.list);
        this.mView.setGallaryData(tempData, this.getCombinations(tempData.list));
    }

    private onShowPanelHandler(type: string) {
        const uiManager = this.game.uiManager;
        if (type === "make") {
            uiManager.showMed(ModuleName.PICAMANUFACTURE_NAME);
        } else if (type === "cooking") {
            uiManager.showMed(ModuleName.PICACOOKING_NAME);
        }
        this.onCloseHandler();
    }

    private sortGallery(list: any[]) {

        this.config.getBatchItemDatas(list);
        list.sort((a, b) => {
            if (a.code >= b.code) return 1;
            else return -1;
        });
    }

    private getLevelGroup() {
        const dexMap = this.config.getGalleryMap(GalleryType.dexLevel);
        const mapGroup = new Map();
        dexMap.forEach((value, key) => {
            let group: IGalleryLevelGroup;
            if (mapGroup.has(value.level)) {
                group = mapGroup.get(value.level);
                group.gallery.push(value);
            } else {
                group = { level: value.level, progress: 0, rewards: false, gallery: [value] };
                mapGroup.set(value.level, group);
            }
        });
        return mapGroup;
    }

    private getCombinations(list: op_client.IPKT_GALLERY_ITEM[]) {
        const map = <any>this.config.getGalleryMap(GalleryType.combination);
        const combinations: IGalleryCombination[] = Array.from(map.values());
        const tempMap = new Map();
        list.forEach((value) => {
            tempMap.set(value.id, value);
        });
        for (const data of combinations) {
            if (data.requirement) {
                data.requirement.sort((a, b) => {
                    if (a.code >= b.code) return 1;
                    else return -1;
                });

                for (const temp of <any>data.requirement) {
                    if (tempMap.has(temp.id)) {
                        temp.status = tempMap.get(temp.id).status;
                    } else {
                        temp.status = 1;
                    }
                }
            }
        }
        return combinations;
    }

    private getCollectCombinations(datas: IGalleryCollection[]) {
        const map = <any>this.config.getGalleryMap(GalleryType.combination);
        for (const temp of datas) {
            if (map.has(temp.rewardId)) {
                const combination = map.get(temp.rewardId);
                ObjectAssign.excludeAllAssign(temp, combination);
            }
        }
        return datas;
    }
    get gallery() {
        const cache: CacheDataManager = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        return cache.gallery;
    }
    private getRedSystem() {
        const game = <PicaGame>this.game;
        const obj = {};
        const gallery = game.getRedPoints(MainUIRedType.GALLERY);
        const redlist = [];
        if (gallery && gallery.length > 0) redlist.push(MainUIRedType.GALLERY);
        obj["redlist"] = redlist;
        obj[MainUIRedType.GALLERY] = gallery;
        return obj;
    }
    private onRedSystemHandler(reds: number[]) {
        const obj = this.getRedSystem();
        if (this.mView) this.mView.setRedsState(obj);
    }
    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
