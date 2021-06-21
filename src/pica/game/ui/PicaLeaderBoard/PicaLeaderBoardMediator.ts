import { op_client, op_def } from "pixelpai_proto";
import { BasicMediator, CacheDataManager, DataMgrType, Game } from "gamecore";
import { ModuleName } from "structure";
import { BaseDataConfigManager, GalleryType } from "../../config";
import { PicaLeaderBoard } from "./PicaLeaderBoard";
import { IGalleryCombination, IGalleryLevelGroup, IGalleryCollection, MainUIRedType, RedEventType } from "../../../structure";
import { PicaGame } from "../../pica.game";
import { ObjectAssign } from "utils";
export class PicaLeaderBoardMediator extends BasicMediator {
    protected mModel: PicaLeaderBoard;
    private mScneType: op_def.SceneTypeEnum;
    private tempDatas: any = {};
    constructor(game: Game) {
        super(ModuleName.PICALEADERBOARD_NAME, game);
        this.mScneType = op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        this.mModel = new PicaLeaderBoard(game, this.mScneType);
    }

    onEnable() {
        this.proto.on("TARGET_RANKLIST_DATA", this.onSetLeaderBoardDataHandler, this);
    }

    onDisable() {
        this.proto.off("TARGET_RANKLIST_DATA", this.onSetLeaderBoardDataHandler, this);
    }
    show(param?: any) {
        if (param) {
            //  后端主动打开时，有参数：id控制打开哪个面板；title控制页面标题,这里可以对数据进行处理
            // param.title= this.config.getI18n(param.title);
        }
        super.show(param);
        // this.game.emitter.on(this.key + "_openpanel", this.onShowPanelHandler, this);
        this.game.emitter.on(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.on(this.key + "_getranklistdata", this.getRankListData, this);
    }

    hide() {
        // this.game.emitter.off(this.key + "_openpanel", this.onShowPanelHandler, this);
        this.game.emitter.off(this.key + "_close", this.onCloseHandler, this);
        this.game.emitter.off(this.key + "_getranklistdata", this.getRankListData, this);
        super.hide();
    }

    destroy() {
        super.destroy();
    }
    getHeadImgList(uids: string[]): Promise<any> {
        return new Promise<any>((resolve) => { resolve(this.game.httpService.userHeadsImage(uids)); });
    }
    protected panelInit() {
        super.panelInit();
    }

    private onCloseHandler() {
        this.hide();
    }
    /**
     * 获取排行榜数据
     * @param id
     */
    private getRankListData(tag: string) {
        this.game.sendCustomProto("STRING", "postTargetRankingList", { id: tag });
        // 测试数据
        // this.onSetLeaderBoardDataHandler({
        //     content: {
        //         "rankdatas": [
        //             {
        //                 "rank": 1,
        //                 "platformId": "60bde1d4f0da9b0e7ce1307a",
        //                 "nickname": "player1",
        //                 "score": 99999
        //             },
        //             {
        //                 "rank": 2,
        //                 "platformId": "60bde1d4f0da9b0e7ce1307a",
        //                 "nickname": "player311111111111111",
        //                 "score": 80
        //             },
        //             {
        //                 "rank": 3,
        //                 "platformId": "60bde1d4f0da9b0e7ce1307a",
        //                 "nickname": "player4",
        //                 "score": 80
        //             },
        //             {
        //                 "rank": 4,
        //                 "platformId": "60bde1d4f0da9b0e7ce1307a",
        //                 "nickname": "player6",
        //                 "score": 80
        //             },
        //             {
        //                 "rank": 5,
        //                 "platformId": "60bde1d4f0da9b0e7ce1307a",
        //                 "nickname": "player2",
        //                 "score": 60
        //             },
        //             {
        //                 "rank": 6,
        //                 "platformId": "60bde1d4f0da9b0e7ce1307a",
        //                 "nickname": "player5",
        //                 "score": 60
        //             },
        //             {
        //                 "rank": 7,
        //                 "platformId": "60bde1d4f0da9b0e7ce1307a",
        //                 "nickname": "player7",
        //                 "score": 60
        //             },
        //             {
        //                 "rank": 8,
        //                 "platformId": "60bde1d4f0da9b0e7ce1307a",
        //                 "nickname": "222",
        //                 "score": 20
        //             }
        //         ],
        //         "score": 99999,
        //         "rank": 1
        //     }
        // });
    }

    private onSetLeaderBoardDataHandler(proto: any) {
        const content = proto.content;
        const uids = [];
        const infos = [];
        for (const data of content.rankdatas) {
            uids.push(data.platformId);
            infos.push(data);
        }
        const myId = this.game.user.userData.playerProperty.playerInfo.cid;
        uids.push(myId);
        const myNickName = this.game.user.userData.playerProperty.playerInfo.nickname;
        // TODO 把我的id也放进这个id集合中，这样也能获取到我的avatar，在detail面板中对比id来设置头像
        const avatars = [];
        this.getHeadImgList(uids).then((response) => {
            const datas: any[] = response.data;
            for (const data of datas) {
                avatars.push(data);
            }
            if (this.mView) this.mView.setDetailPanel({ rank: content.rank, score: content.score, platformId: myId, nickname: myNickName }, content.rankdatas, avatars);
        });
    }
    // private onShowPanelHandler(type: string) {
    //     const uiManager = this.game.uiManager;
    //     // if (type === "cook") {
    //     //     this.game.sendCustomProto("STRING", "galleryFacade:sendCollectionRewardTakenList", {});

    //     //     uiManager.showMed(ModuleName.PICACOOKING_NAME);
    //     // }
    //     this.onCloseHandler();
    // }

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
                group = { level: value.level, progress: 0, rewards: false, allReceived: false, gallery: [value] };
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
                temp.hasRewards = this.collectHaveRewards(temp);
            }
        }
        datas.sort((a, b) => {
            if (a.hasRewards) return -1;
            else return 1;
        });
        return datas;
    }

    private collectHaveRewards(data: IGalleryCollection) {
        const len = data.rewardItems.length;
        for (let i = 0; i < len; i++) {
            const needCount = data.subsection[i];
            if (data.gotcount >= needCount && data.gotindex.indexOf(i + 1) === -1) {
                return true;
            }
        }
        return false;
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
