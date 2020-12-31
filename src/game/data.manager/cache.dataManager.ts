import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { EventType } from "structure";
import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BaseHandler } from "./base.handler";
export class CacheDataManager extends BaseHandler {

    private mBagCategory: Map<number, any> = new Map();
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
}
