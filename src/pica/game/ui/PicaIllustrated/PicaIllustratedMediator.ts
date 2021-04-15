import { op_client, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { ConnectState, EventType, ModuleName } from "structure";
import { BaseDataConfigManager, GalleryType } from "picaWorker";
import { PicaIllustrated } from "./PicaIllustrated";
import { ICountablePackageItem, IGalleryCombination, IGalleryLevel } from "picaStructure";
export class PicaIllustratedMediator extends BasicMediator {
    protected mModel: PicaIllustrated;
    private mScneType: op_def.SceneTypeEnum;
    constructor(game: Game) {
        super(ModuleName.PICAILLUSTRATED_NAME, game);
        this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        this.mModel = new PicaIllustrated(game, this.mScneType);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(this.key + "_queryrewards", this.onQueryRewardsHandler, this);
        this.game.emitter.on(this.key + "_querycombinations", this.onQueryCombinationsHandler, this);
        this.game.emitter.on(this.key + "_openpanel", this.onShowPanelHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(EventType.GALLERY_UPDATE, this.setGallaryData, this);
        this.game.emitter.on(EventType.DONE_MISSION_LIST, this.setDoneMissionIdListHandler, this);
    }

    hide() {
        this.game.emitter.off(this.key + "_queryrewards", this.onQueryRewardsHandler, this);
        this.game.emitter.on(this.key + "_querycombinations", this.onQueryCombinationsHandler, this);
        this.game.emitter.off(this.key + "_openpanel", this.onShowPanelHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(EventType.GALLERY_UPDATE, this.setGallaryData, this);
        this.game.emitter.off(EventType.DONE_MISSION_LIST, this.setDoneMissionIdListHandler, this);
        super.hide();
    }

    destroy() {
        super.destroy();
    }

    protected panelInit() {
        super.panelInit();
        if (this.mPanelInit) {
            if (this.mView) {
                this.setGallaryData();
                this.setDoneMissionIdListHandler();
            }
        }
    }

    private onCloseHandler() {
        this.hide();
    }

    private onQueryRewardsHandler(type: number) {
        this.mModel.query_GALLARY_PROGRESS_REWARD(type);
    }

    private onQueryCombinationsHandler(id: number) {
        this.mModel.query_GALLARY_COLLECTION_REWARD(id);
    }

    private setGallaryData() {
        if (!this.mPanelInit) return;
        const cache: CacheDataManager = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        this.mShowData = cache.gallery;
        this.sortGallery(this.mShowData.list);
        const dexLevel = <IGalleryLevel>this.config.getGallery(this.mShowData.reward1NextIndex, GalleryType.dexLevel);
        if (dexLevel === undefined) {
            this.mShowData.reward1Max = -1;
        } else {
            this.mShowData.reward1Max = dexLevel.exp;
        }
        const galleryLevel = <IGalleryLevel>this.config.getGallery(this.mShowData.reward2NextIndex, GalleryType.galleryLevel);
        if (galleryLevel === undefined) {
            this.mShowData.reward2Max = -1;
        } else {
            this.mShowData.reward2Max = galleryLevel.exp || 0;
        }
        this.mView.setGallaryData(this.mShowData, this.getCombinations(this.mShowData.list));
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

    private setDoneMissionIdListHandler() {
        const cache: CacheDataManager = this.game.getDataMgr<CacheDataManager>(DataMgrType.CacheMgr);
        const list = cache.doneMissionIdList;
        if (this.mView) this.mView.setDoneMissionList(list);
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

    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
