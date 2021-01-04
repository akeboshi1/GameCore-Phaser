import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BaseHandler } from "./base.handler";
export class CacheDataManager extends BaseHandler {

    private mBagCategory: Map<number, any> = new Map();
    private furiRecasteMap: Map<string, any> = new Map();
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
        if (this.furiRecasteMap.has(subcategory)) {
            const list = this.furiRecasteMap.get(subcategory);
            const tempArr = [];
            for (const data of list) {
                if (data.star === star) {
                    tempArr.push(data);
                }
            }
            return tempArr;
        } else {
            if (subcategory === "alltype") {
                const tempArr = [];
                this.furiRecasteMap.forEach((value) => {
                    for (const data of value) {
                        if (data.star === star) {
                            tempArr.push(data);
                        }
                    }
                });
                return tempArr;
            }
        }
        return null;
    }
}
