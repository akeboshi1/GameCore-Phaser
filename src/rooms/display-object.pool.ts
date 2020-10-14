import { Terrain } from "./terrain/terrain";
import { Element, InputEnable } from "./element/element";
import { op_client } from "pixelpai_proto";
import { ISprite } from "./element/sprite";

export class DisplayObjectPool {
    private terrains = new Map();
    private mosses = new Map();
    private elements = new Map();

    private readonly POOLOBJECTCONFIG = {
        terrains: Terrain,
        mosses: Element,
        elements: Element,
    };

    constructor() {}

    getPool(poolName: string) {
        return this[poolName];
    }

    push(poolName: string, id: string, sprite: ISprite, manager: any) {
        const pool = this[poolName];

        const obj: Terrain | Element = new this.POOLOBJECTCONFIG[poolName](sprite, manager);
        obj.setBlockable(false);
        obj.setRenderable(true);
        if (obj instanceof Element) {
            obj.setInputEnable(InputEnable.Enable);
        }
        pool.set(id, obj);
    }

    remove(poolName: string, id: string) {
        const obj = this[poolName].get(id);

        if (obj) {
            obj.isUsed = false;
            obj.destroy();
        }

        this[poolName].delete(id);
    }

    update(poolName: string, id: string, newSprite: ISprite) {
        const pool = this[poolName];

        const obj = pool.get(id);

        if (obj) {
            obj.isUsed = true;
            obj.setModel(newSprite);
        }
    }

    destroy() {
        for (const key of Object.keys(this.POOLOBJECTCONFIG)) {
            this[key].clear();
        }
    }
}
