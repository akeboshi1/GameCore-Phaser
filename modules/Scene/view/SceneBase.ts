import {SceneBasic} from "./SceneBasic";
import {Log} from "../../../Log";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {TerrainSceneLayer} from "./TerrainSceneLayer";
import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {HashMap} from "../../../base/ds/HashMap";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {TerrainGridLayer} from "./TerrainGridLayer";
import {DrawSceneLayer} from "./DrawSceneLayer";
import {TerrainEditorLayer} from "./TerrainEditorLayer";
import {GameConfig} from "../../../GameConfig";

export class SceneBase extends SceneBasic {
    public mapSceneInfo: SceneInfo;

    // layers...
    public terrainGridLayer: TerrainGridLayer = null;
    public drawSceneLayer: DrawSceneLayer = null;
    public terrainSceneLayer: TerrainSceneLayer = null;
    public terrainEditorLayer: TerrainEditorLayer = null;
    public topSceneLayer: DisplaySortableSceneLayer = null;
    public middleSceneLayer: DisplaySortableSceneLayer = null;
    public bottomSceneLayer: DisplaySortableSceneLayer = null;
    // all scenes objects
    private mSceneElements: HashMap = new HashMap();

    public onTick(deltaTime: number): void {
        super.onTick(deltaTime);

        this.terrainGridLayer.onTick(deltaTime);
        if (this.terrainSceneLayer) {
            this.terrainSceneLayer.onTick(deltaTime);
        }
        if (this.terrainEditorLayer) {
            this.terrainEditorLayer.onTick(deltaTime);
        }
        this.topSceneLayer.onTick(deltaTime);
        this.middleSceneLayer.onTick(deltaTime);
        this.bottomSceneLayer.onTick(deltaTime);
        this.drawSceneLayer.onTick(deltaTime);

    }

    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);

        this.terrainGridLayer.onFrame(deltaTime);
        if (this.terrainSceneLayer) {
            this.terrainSceneLayer.onFrame(deltaTime);
        }
        if (this.terrainEditorLayer) {
            this.terrainEditorLayer.onFrame(deltaTime);
        }
        this.topSceneLayer.onFrame(deltaTime);
        this.middleSceneLayer.onFrame(deltaTime);
        this.bottomSceneLayer.onFrame(deltaTime);
        this.drawSceneLayer.onFrame(deltaTime);

    }

    public addSceneEntity(sceneEntity: BasicSceneEntity): BasicSceneEntity {
        if (this.mSceneElements.has(sceneEntity.uid)) {
            Log.trace("Scene::addSceneElement exsit error." + " uid: " + sceneEntity.uid);
            return null;
        }

        this.mSceneElements.add(sceneEntity.uid, sceneEntity);

        switch (sceneEntity.sceneLayerType) {
            case Const.SceneConst.SceneLayerBottom:
                this.bottomSceneLayer.addEntity(sceneEntity);
                break;

            case Const.SceneConst.SceneLayerMiddle:
                this.middleSceneLayer.addEntity(sceneEntity);
                break;

            case Const.SceneConst.SceneLayerTop:
                this.topSceneLayer.addEntity(sceneEntity);
                break;

            default:
                throw new Error("addSceneEntity no scene layer!");
        }

        return sceneEntity;
    }

    public getSceneElement(uid: number): BasicSceneEntity {
        return this.mSceneElements.getValue(uid) as BasicSceneEntity;
    }

    public getSceneElementByFunction(filterFunction: Function): BasicSceneEntity {
        let element: BasicSceneEntity;
        for (let i = 0; i < this.mSceneElements.valueList.length; i++) {
            element = this.mSceneElements.valueList[i];
            if (filterFunction(element)) {
                return element;
            }
        }
        return null;
    }

    public getSceneElementsByFunction(filterFunction: Function): Array<BasicSceneEntity> {
        let results: Array<BasicSceneEntity> = [];
        let element: BasicSceneEntity;
        for (let i = 0; i < this.mSceneElements.valueList.length; i++) {
            element = this.mSceneElements.valueList[i];
            if (filterFunction(element)) {
                results.push(element);
            }
        }
        return results;
    }

    public removeAllSceneElements(filterPassFunction: Function = null): void {
        let element: BasicSceneEntity;
        for (let i = 0; i < this.mSceneElements.valueList.length; i++) {
            element = this.mSceneElements.valueList[i];
            if (filterPassFunction == null || filterPassFunction(element)) {
                this.deleteSceneElement(element.uid);
                --i;
            }
        }
    }

    public deleteSceneElement(uid: number): BasicSceneEntity {
        let element: BasicSceneEntity = this.mSceneElements.getValue(uid) as BasicSceneEntity;

        if (!element) {
            Log.trace("Scene::deleteSceneElement not exsit error. uid: " + uid);
            return null;
        }
        this.mSceneElements.remove(uid);

        switch (element.sceneLayerType) {
            case Const.SceneConst.SceneLayerBottom:
                this.bottomSceneLayer.removeEntity(element);
                break;

            case Const.SceneConst.SceneLayerMiddle:
                this.middleSceneLayer.removeEntity(element);
                break;

            case Const.SceneConst.SceneLayerTop:
                this.topSceneLayer.removeEntity(element);
                break;

            default:
                throw new Error("addSceneElement no scene layer!");
        }

        return element;
    }

    // ----------------------------------------------------------------------

    protected onInitialize(): void {
        super.onInitialize();

        this.drawSceneLayer = new DrawSceneLayer(this.game);
        this.drawSceneLayer.scene = this;
        this.addChild(this.drawSceneLayer);

        if (GameConfig.isEditor) {
            this.terrainEditorLayer = new TerrainEditorLayer(this.game);
            this.terrainEditorLayer.scene = this;
            this.addChild(this.terrainEditorLayer);
        } else {
            this.terrainSceneLayer = new TerrainSceneLayer(this.game);
            this.terrainSceneLayer.scene = this;
            this.addChild(this.terrainSceneLayer);
        }

        this.terrainGridLayer = new TerrainGridLayer(this.game);
        this.terrainGridLayer.scene = this;
        this.addChild(this.terrainGridLayer);


        this.bottomSceneLayer = new DisplaySortableSceneLayer(this.game);
        this.bottomSceneLayer.scene = this;
        this.addChild(this.bottomSceneLayer);

        this.middleSceneLayer = new DisplaySortableSceneLayer(this.game);
        this.middleSceneLayer.scene = this;
        this.addChild(this.middleSceneLayer);

        this.topSceneLayer = new DisplaySortableSceneLayer(this.game);
        this.topSceneLayer.scene = this;
        this.addChild(this.topSceneLayer);
    }

    protected onInitializeScene(value: SceneInfo): void {
        this.mSceneScrollWidth = this.mapSceneInfo.mapTotalWidth;
        this.mSceneScrollHeight = this.mapSceneInfo.mapTotalHeight + Const.GameConst.MAP_TILE_DEPTH;
        if (this.terrainSceneLayer) {
            this.terrainSceneLayer.initializeMap(this.mapSceneInfo);
        }
        if (this.terrainEditorLayer) {
            this.terrainEditorLayer.initializeMap(this.mapSceneInfo);
        }
        let rect: Phaser.Rectangle = new Phaser.Rectangle(0, 0, this.mapSceneInfo.mapTotalWidth, this.mapSceneInfo.mapTotalHeight);
        this.bottomSceneLayer.initialize(rect);
        this.middleSceneLayer.initialize(rect);
        this.topSceneLayer.initialize(rect);
    }

    protected onActivedScene(): void {
        super.onActivedScene();
        Globals.MouseMod.scene = this;
    }

    protected onDeActivedScene(): void {
        super.onDeActivedScene();
        if (this.terrainSceneLayer) {
            this.terrainSceneLayer.releaseTerrainItems();
        }
        if (this.terrainEditorLayer) {
            this.terrainEditorLayer.releaseTerrainItems();
        }
        Globals.MouseMod.scene = null;
    }

    protected onClearScene(): void {
        super.onClearScene();
        this.removeAllSceneElements();
        if (this.terrainSceneLayer) {
            this.terrainSceneLayer.clear();
        }
        if (this.terrainEditorLayer) {
            this.terrainEditorLayer.clear();
        }
        this.drawSceneLayer.clear();
        Globals.MessageCenter.emit(MessageType.SCENE_CLEARED);
    }

    protected onStageResize(): void {
        super.onStageResize();
    }
}
