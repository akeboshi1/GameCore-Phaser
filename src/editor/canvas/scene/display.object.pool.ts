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
    private walls = new Map();
    private caches = new Map();

    private readonly POOLOBJECTCONFIG = {
        terrains: BaseFramesDisplay,
        mosses: BaseFramesDisplay,
        elements: BaseFramesDisplay,
        walls: BaseFramesDisplay,
    };

    constructor(private sceneEditor: SceneEditorCanvas) {}

    getPool(poolName: string) {
        return this[poolName];
    }

    push(poolName: string, id: string, sprite: Sprite) {
        const pool = this[poolName];

        // const obj: BaseFramesDisplay = new this.POOLOBJECTCONFIG[poolName](sprite, manager);
        // let layer = "surfaceLayer";
        const obj = this.sceneEditor.factory.createFramesDisplayBYSprite(sprite);
        if (obj.nodeType === op_def.NodeType.ElementNodeType || obj.nodeType === op_def.NodeType.MossType || obj.nodeType === op_def.NodeType.SpawnPointType) {
            obj.setInteractive();
            obj.setPosition(sprite.pos.x, sprite.pos.y);
        } else if (obj.nodeType === op_def.NodeType.TerrainNodeType || obj.nodeType === op_def.NodeType.WallNodeType) {
            // layer = "groundLayer";
            const pos = Position45.transformTo90(new LogicPos(sprite.pos.x, sprite.pos.y), this.sceneEditor.roomSize);
            obj.setPosition(pos.x, pos.y);
        }
        (<any>this.sceneEditor.scene).layerManager.addToLayer(sprite.layer.toString(), obj);
        pool.set(id, obj);

        if (this.caches) {
            this.caches.set(sprite.id, true);
            const cachelist = Array.from(this.caches.values());
            const result = cachelist.filter((bol) => bol === false);
            if (result.length === 0) {
                this.caches.forEach((value, key) => {
                    const ele = this.get(key.toString());
                    if (ele) ele.asociate();
                });
                this.caches.clear();
                this.caches = null;
            }
        }
        // this.caches.forEach((val) => if (val === false) done = false )
    }

    remove(poolName: string, id: string) {
        const obj = this[poolName].get(id);

        if (obj) {
            this.tryDeleteMountSprites(obj.getMountIds());
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
            if (obj.nodeType === op_def.NodeType.TerrainNodeType || obj.nodeType === op_def.NodeType.WallNodeType) {
                const pos = Position45.transformTo90(new LogicPos(newSprite.pos.x, newSprite.pos.y), this.sceneEditor.roomSize);
                obj.setPosition(pos.x, pos.y);
            }
        }
    }

    addCache(id: number) {
        this.caches.set(id, false);
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

    private tryDeleteMountSprites(mountIds: number[]) {
        if (!mountIds || mountIds.length < 1) {
            return;
        }
        for (const mount of mountIds) {
            const ele = this.get(mount.toString());
            if (ele) {
                if (ele.isMoss) {
                    this.sceneEditor.mossManager.deleteMosses([ele.id]);
                } else {
                    this.sceneEditor.elementManager.deleteElements([ele.id]);
                }
            }
        }
    }
}
