import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BaseHandler } from "./base.handler";
export class CacheDataManager extends BaseHandler {
    public chapters: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS;
    public guidText: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_ROOM_SHOW_GUIDE_TEXT;
    public gallery: op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY;
    public isSurveyStatus: boolean = false;
    private mBagCategory: Map<number, any> = new Map();
    private furiRecasteMap: Map<string, any> = new Map();
    private mChaptersMap: Map<number, any> = new Map();
    constructor(game: Game, event?: EventDispatcher) {
        super(game, event);
    }
    clear() {
        super.clear();
        this.mBagCategory.clear();
    }

    destroy() {
        super.destroy();
    }

    setBagCategory(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES) {
        this.mBagCategory.set(content.category, content);
    }

    getBagCategory(category: number) {
        return this.mBagCategory.get(category);
    }

    setRecasteList(list: op_client.ICountablePackageItem[]) {
        for (const data of list) {
            if (this.furiRecasteMap.has(data.subcategory)) {
                const templist = this.furiRecasteMap.get(data.subcategory);
                templist.push(data);
            } else {
                const templist = [data];
                this.furiRecasteMap.set(data.subcategory, templist);
            }
        }
    }

    getRecasteList(subcategory: string, star: number) {
        if (this.furiRecasteMap.size === 0) return null;
        const tempArr = [];
        if (this.furiRecasteMap.has(subcategory)) {
            const list = this.furiRecasteMap.get(subcategory);
            for (const data of list) {
                if (data.grade === star) {
                    tempArr.push(data);
                }
            }
            return tempArr;
        } else {
            if (subcategory === "alltype") {
                this.furiRecasteMap.forEach((value) => {
                    for (const data of value) {
                        if (data.grade === star) {
                            tempArr.push(data);
                        }
                    }
                });
                return tempArr;
            }
        }
        return tempArr;
    }

    setChapters(datas: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_CHAPTER_PROGRESS) {
        this.chapters = datas;
        const chapters = datas.chapters;
        if (chapters) {
            for (const data of chapters) {
                this.mChaptersMap.set(data.chapterId, data);
            }
        }
    }

    getChapter(chapterId: number) {
        if (this.mChaptersMap.has(chapterId)) {
            return this.mChaptersMap.get(chapterId);
        }
        return undefined;
    }

    setGallery(content: op_client.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_UPDATE_GALLERY) {
        if (!this.gallery) this.gallery = content;
        else {
            this.gallery.reward1NextIndex = content.reward1NextIndex;
            this.gallery.reward2NextIndex = content.reward2NextIndex;
            this.gallery.reward1Progress = content.reward1Progress;
            this.gallery.reward2Progress = content.reward2Progress;
            for (const item of content.list) {
                let have = false;
                for (const temp of this.gallery.list) {
                    if (temp.id === item.id) {
                        temp.status = item.status;
                        have = true;
                    }
                }
                if (!have) this.gallery.list.push(item);
            }
        }
        this.game.emitter.emit(EventType.GALLERY_UPDATE, this.gallery);
    }
}
