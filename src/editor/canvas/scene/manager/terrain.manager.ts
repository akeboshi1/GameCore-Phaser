import {SceneEditor, SceneEditorCanvas} from "../scene.editor.canvas";
import {Ground} from "baseRender";
import {IPos, ITilesetProperty, LayerName} from "structure";

export class EditorTerrainManager {
    private mGround: Ground;

    constructor(protected sceneEditor: SceneEditorCanvas) {
    }

    destroy() {
        if (this.mGround) {
            this.mGround.destroy();
        }
    }

    create(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.mGround) {
                this.mGround.destroy();
            }
            this.mGround = new Ground(this.sceneEditor.scene, this.sceneEditor.url, this.sceneEditor.scaleRatio);
            (<SceneEditor> this.sceneEditor.scene).layerManager.addToLayer(LayerName.GROUND, this.mGround);
            this.mGround.load({id: this.sceneEditor.sceneNode.id + "", resRoot: this.sceneEditor.config.LOCAL_HOME_PATH})
                .then(() => {
                    const properties = this.mGround.getAllTilesetProperties();
                    this.sceneEditor.elementStorage.updateTilesets(properties);
                    resolve();
                })
                .catch(() => {
                    // 允许加载失败
                    resolve();
                });
        });
    }

    existTerrain(x: number, y: number) {
        if (!this.mGround) return false;
        return this.mGround.existTerrain(x, y);
    }

    addTerrains(terrainCoorData) {
        for (const pos of terrainCoorData.locs) {
            this.changeGroundBySN(pos, terrainCoorData.sn);
        }
    }

    removeTerrains(locations: IPos[]) {
        for (const location of locations) {
            this.changeGroundByTilesetIndex(location, -1);
        }
    }

    protected changeGroundBySN(pos45: IPos, sn: string) {
        const index = this.sceneEditor.elementStorage.getTilesetIndexBySN(sn);
        this.changeGroundByTilesetIndex(pos45, index);
    }

    protected changeGroundByTilesetIndex(pos45: IPos, key: number) {
        this.mGround.changeAt(pos45, key);
    }
}
