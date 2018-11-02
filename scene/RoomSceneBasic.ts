import {SceneBasic} from "./SceneBasic";
import {Log} from "../Log";
import {Const} from "../const/Const";
import Globals from "../Globals";
import {MessageType} from "../const/MessageType";
import {MapInfo} from "../struct/MapInfo";
import {TerrainSceneLayer} from "./TerrainSceneLayer";
import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {HashMap} from "./util/HashMap";
import {BasicSceneEntity} from "../base/BasicSceneEntity";

export class RoomSceneBasic extends SceneBasic {
    public mapSceneInfo: MapInfo;

    //layers...
    public terrainSceneLayer: TerrainSceneLayer = null;
    public topSceneLayer: DisplaySortableSceneLayer = null;
    public middleSceneLayer: DisplaySortableSceneLayer = null;
    public bottomSceneLayer: DisplaySortableSceneLayer = null;

    //all scenes objects
    private mSceneElements: HashMap = new HashMap();

    public notifyInitializeSceneComplete(): void {
        Globals.MessageCenter.dispatch(MessageType.SCENE_INITIALIZED);
    }

    public onTick(deltaTime: number): void {
        super.onTick(deltaTime);

        this.terrainSceneLayer.onTick(deltaTime);
        this.topSceneLayer.onTick(deltaTime);
        this.middleSceneLayer.onTick(deltaTime);
        this.bottomSceneLayer.onTick(deltaTime);
    }

    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);

        this.topSceneLayer.onFrame(deltaTime);
        this.middleSceneLayer.onFrame(deltaTime);
        this.bottomSceneLayer.onFrame(deltaTime);
        this.terrainSceneLayer.onFrame(deltaTime);

    }

    public addSceneEntity(sceneEntity: BasicSceneEntity): BasicSceneEntity {
        if (this.mSceneElements.has(sceneEntity.uid)) {
            Log.trace("Scene::addSceneElement exsit error." + " uid: " + sceneEntity.uid);
            return null;
        }

        this.mSceneElements.add(sceneEntity.uid, sceneEntity);

        switch (sceneEntity.sceneLayerType) {
            case Const.SceneConst.SceneLayerBottom:
                this.bottomSceneLayer.add(sceneEntity);
                break;

            case Const.SceneConst.SceneLayerMiddle:
                this.middleSceneLayer.add(sceneEntity);
                break;

            case Const.SceneConst.SceneLayerTop:
                this.topSceneLayer.add(sceneEntity);
                break;

            default:
                throw new Error("addSceneEntity no scene layer!");
        }

        return sceneEntity;
    }

    public getSceneElement(uid: string): BasicSceneEntity {
        return this.mSceneElements.getValue(uid) as BasicSceneEntity;
    }

    public getSceneElementByFunction(filterFunction: Function): BasicSceneEntity {
        let element: BasicSceneEntity;
        for (let i: number = 0; i < this.mSceneElements.valueList.length; i++) {
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
        for (let i: number = 0; i < this.mSceneElements.valueList.length; i++) {
            element = this.mSceneElements.valueList[i];
            if (filterFunction(element)) {
                results.push(element);
            }
        }
        return results;
    }

    public removeAllSceneElements(filterPassFunction: Function = null): void {
        let element: BasicSceneEntity;
        let i: number = 0;
        for (; i < this.mSceneElements.valueList.length; i++) {
            element = this.mSceneElements.valueList[i];
            if (filterPassFunction == null || filterPassFunction(element)) {
                this.deleteSceneElement(element.uid);
                --i;
            }
        }
    }

    public deleteSceneElement(uid: string): BasicSceneEntity {
        let element: BasicSceneEntity = this.mSceneElements.getValue(uid) as BasicSceneEntity;

        if (!element) {
            Log.trace("Scene::deleteSceneElement not exsit error. uid: " + uid);
            return null;
        }
        this.mSceneElements.remove(uid);

        switch (element.sceneLayerType) {
            case Const.SceneConst.SceneLayerBottom:
                this.bottomSceneLayer.remove(element);
                break;

            case Const.SceneConst.SceneLayerMiddle:
                this.middleSceneLayer.remove(element);
                break;

            case Const.SceneConst.SceneLayerTop:
                this.topSceneLayer.remove(element);
                break;

            default:
                throw new Error("addSceneElement no scene layer!");
        }

        return element;
    }

    //----------------------------------------------------------------------

    protected onInitialize(): void {
        super.onInitialize();

        this.terrainSceneLayer = new TerrainSceneLayer(this.game);
        this.terrainSceneLayer.scene = this;
        this.terrainSceneLayer.camera = this.camera;
        this.addChild(this.terrainSceneLayer);
        //--

        this.bottomSceneLayer = new DisplaySortableSceneLayer(this.game);
        this.bottomSceneLayer.scene = this;
        this.bottomSceneLayer.camera = this.camera;
        this.addChild(this.bottomSceneLayer);

        this.middleSceneLayer = new DisplaySortableSceneLayer(this.game);
        this.middleSceneLayer.camera = this.camera;
        this.middleSceneLayer.scene = this;
        this.addChild(this.middleSceneLayer);

        this.topSceneLayer = new DisplaySortableSceneLayer(this.game);
        this.topSceneLayer.camera = this.camera;
        this.topSceneLayer.scene = this;
        this.addChild(this.topSceneLayer);
    }

    protected onInitializeScene(value: MapInfo): void {
        this.mSceneScrollWidth = this.mapSceneInfo.mapTotalWidth;
        this.mSceneScrollHeight = this.mapSceneInfo.mapTotalHeight + Const.GameConst.MAP_TILE_DEPTH;
        this.terrainSceneLayer.initializeMap(this.mapSceneInfo);
    }

    protected onActivedScene(): void {
        super.onActivedScene();
    }

    protected onDeActivedScene(): void {
        super.onDeActivedScene();
    }

    protected onClearScene(): void {
        super.onClearScene();
        this.removeAllSceneElements();
        this.terrainSceneLayer.clear();
        Globals.MessageCenter.dispatch(MessageType.SCENE_CLEARED);
    }

    protected onStageResize(): void {
        super.onStageResize();
    }
}