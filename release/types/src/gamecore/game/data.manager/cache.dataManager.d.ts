import { op_client } from "pixelpai_proto";
import { EventDispatcher } from "structure";
import { Game } from "../game";
import { BaseHandler } from "./base.handler";
export declare class CacheDataManager extends BaseHandler {
    chapters: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS;
    guidText: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ROOM_SHOW_GUIDE_TEXT;
    gallery: op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY;
    doneMissionIdList: number[];
    isSurveyStatus: boolean;
    queryUnlockFurinture: boolean;
    roomUpgradeState: any;
    private mBagCategory;
    private furiRecasteMap;
    private mChaptersMap;
    constructor(game: Game, event?: EventDispatcher);
    clear(): void;
    destroy(): void;
    setBagCategory(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES): void;
    getBagCategory(category: number): any;
    setRecasteList(list: op_client.ICountablePackageItem[]): void;
    getRecasteList(subcategory: string, star: number): any[];
    setChapters(datas: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS): void;
    getChapter(chapterId: number): any;
    setGallery(content: op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY): void;
}
