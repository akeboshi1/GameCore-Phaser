import { Sprite } from "baseModel";
import { BaseFramesDisplay } from "baseRender";
import { op_def  } from "pixelpai_proto";
import { ISprite } from "structure";
import { LogicPos, Position45 } from "utils";
import { SceneEditorCanvas } from "./scene.editor.canvas";

export class DisplayObjectPool {
    private terrains = new Map();
    private mosses = new Map();
    private elements = new Map();

    private readonly POOLOBJECTCONFIG = {
        terrains: BaseFramesDisplay,
        mosses: BaseFramesDisplay,
        elements: BaseFramesDisplay,
    };

    constructor(private sceneEditor: SceneEditorCanvas) {}

    getPool(poolName: string) {
        return this[poolName];
    }

    push(poolName: string, id: string, sprite: Sprite, manager: any) {
        const pool = this[poolName];

        // const obj: BaseFramesDisplay = new this.POOLOBJECTCONFIG[poolName](sprite, manager);
        // let layer = "surfaceLayer";
        const obj = this.sceneEditor.factory.createFramesDisplayBYSprite(sprite);
        if (obj.nodeType === op_def.NodeType.ElementNodeType || obj.nodeType === op_def.NodeType.MossType || obj.nodeType === op_def.NodeType.SpawnPointType) {
            obj.setInteractive();
            obj.setPosition(sprite.pos.x, sprite.pos.y);
        } else if (obj.nodeType === op_def.NodeType.TerrainNodeType) {
            // layer = "groundLayer";
            const pos = Position45.transformTo90(new LogicPos(sprite.pos.x, sprite.pos.y), this.sceneEditor.roomSize);
            obj.setPosition(pos.x, pos.y);
        }
        (<any>this.sceneEditor.scene).layerManager.addToLayer(sprite.layer.toString(), obj);
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
            // obj.isUsed = true;
            // obj.setModel(newSprite);
            obj.clear();
            obj.updateSprite(newSprite);
            if (obj.nodeType === op_def.NodeType.TerrainNodeType) {
                const pos = Position45.transformTo90(new LogicPos(newSprite.pos.x, newSprite.pos.y), this.sceneEditor.roomSize);
                obj.setPosition(pos.x, pos.y);
            }
        }
    }

    get(id: string) {
        const arys = [this.elements, this.mosses];
        for (const map of arys) {
            const ele = map.get(id);
            if (ele) {
                return ele;
            }
        }
    }

    destroy() {
        for (const key of Object.keys(this.POOLOBJECTCONFIG)) {
            this[key].clear();
        }
    }
}
