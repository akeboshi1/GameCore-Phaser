import {SceneBasic} from "./SceneBasic";
import {Log} from "../../../Log";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {DisplaySortableSceneLayer} from "./DisplaySortableSceneLayer";
import {HashMap} from "../../../base/ds/HashMap";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {TerrainGridLayer} from "./TerrainGridLayer";
import {DisplaySortableTerrainLayer} from "./DisplaySortableTerrainLayer";
import {GameConfig} from "../../../GameConfig";
import {DisplaySortableEditorTerrainLayer} from "./DisplaySortableEditorTerrainLayer";
import {DisplaySortableEditorSceneLayer} from "./DisplaySortableEditorSceneLayer";

export class SceneBase extends SceneBasic {
  public mapSceneInfo: SceneInfo;

  // layers...
  public terrainGridLayer: TerrainGridLayer = null;
  public terrainSceneLayer: DisplaySortableSceneLayer = null;
  public bottomSceneLayer: DisplaySortableSceneLayer = null;
  public middleSceneLayer: DisplaySortableSceneLayer = null;
  public topSceneLayer: DisplaySortableSceneLayer = null;

  // all scenes terrains
  private mSceneTerrains: HashMap = new HashMap();

  // all scenes elements
  private mSceneElements: HashMap = new HashMap();

  public onTick(deltaTime: number): void {
    super.onTick(deltaTime);

    if (this.terrainGridLayer) {
      this.terrainGridLayer.onTick(deltaTime);
    }
    if (this.terrainSceneLayer) {
      this.terrainSceneLayer.onTick(deltaTime);
    }
    this.middleSceneLayer.onTick(deltaTime);
    this.bottomSceneLayer.onTick(deltaTime);
    this.topSceneLayer.onTick(deltaTime);
  }

  public onFrame(): void {
    super.onFrame();
    if (this.terrainGridLayer) {
      this.terrainGridLayer.onFrame();
    }
    if (this.terrainSceneLayer) {
      this.terrainSceneLayer.onFrame();
    }
    this.middleSceneLayer.onFrame();
    this.bottomSceneLayer.onFrame();
    this.topSceneLayer.onFrame();
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

  public addTerrainEntity(sceneEntity: BasicSceneEntity): void {
    if (this.mSceneTerrains.has(sceneEntity.uid)) {
      Log.trace("Scene::addTerrain exsit error." + " uid: " + sceneEntity.uid);
      return null;
    }

    this.mSceneTerrains.add(sceneEntity.uid, sceneEntity);
    this.terrainSceneLayer.addEntity(sceneEntity);
  }

  public insertTerrainEntity(sceneEntity: BasicSceneEntity, all: boolean = false): void {
    if (this.mSceneTerrains.has(sceneEntity.uid)) {
      Log.trace("Scene::addTerrain exsit error." + " uid: " + sceneEntity.uid);
      return null;
    }

    this.mSceneTerrains.add(sceneEntity.uid, sceneEntity);
    this.terrainSceneLayer.insertEntity(sceneEntity, all);
  }

  public removeTerrainElement(uid: string, all: boolean = false): BasicSceneEntity {
    let element: BasicSceneEntity = this.mSceneTerrains.getValue(uid) as BasicSceneEntity;

    if (!element) {
      Log.trace("Scene::removeTerrainElement not exsit error. uid: " + uid);
      return null;
    }
    this.mSceneTerrains.remove(uid);
    this.terrainSceneLayer.removeEntity(element, all);
    return element;
  }

  public getSceneElement(uid: number): BasicSceneEntity {
    return this.mSceneElements.getValue(uid) as BasicSceneEntity;
  }

  public removeSceneElementsBy(filterPassFunction: Function = null): void {
    let element: BasicSceneEntity;
    for (let i = 0; i < this.mSceneElements.valueList.length; i++) {
      element = this.mSceneElements.valueList[i];
      if (filterPassFunction == null || filterPassFunction(element)) {
        this.deleteSceneElement(element.uid);
        --i;
      }
    }
  }

    public removeAllSceneElements(): void {
        let element: BasicSceneEntity;
        for (let i = 0; i < this.mSceneElements.valueList.length; i++) {
            element = this.mSceneElements.valueList[i];
            this.deleteSceneElement(element.uid);
            --i;
        }
    }

  public removeAllTerrainElements(): void {

    let element: BasicSceneEntity;
    for (let i = 0; i < this.mSceneTerrains.valueList.length; i++) {
      element = this.mSceneTerrains.valueList[i];
      this.removeTerrainElement(element.uid, true);
      --i;
    }
  }

  public deleteSceneElement(uid: number): BasicSceneEntity {
    let element: BasicSceneEntity = this.mSceneElements.getValue(uid) as BasicSceneEntity;

    if (!element) {
      Log.trace("Scene::deleteSceneElement not exsit error. uid: " + uid);
      return null;
    }
    this.mSceneElements.remove(uid);
    // this.drawSceneLayer.removeDraw(element.collisionArea);

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

    if (GameConfig.isEditor) {
      this.terrainSceneLayer = new DisplaySortableEditorTerrainLayer(this.game);
      this.terrainSceneLayer.scene = this;
      this.addChild(this.terrainSceneLayer);
    } else {
      this.terrainSceneLayer = new DisplaySortableTerrainLayer(this.game);
      this.terrainSceneLayer.scene = this;
      this.addChild(this.terrainSceneLayer);
    }

    this.terrainGridLayer = new TerrainGridLayer(this.game);
    this.terrainGridLayer.scene = this;
    this.addChild(this.terrainGridLayer);

    this.bottomSceneLayer = new DisplaySortableSceneLayer(this.game);
    this.bottomSceneLayer.scene = this;
    this.addChild(this.bottomSceneLayer);

    if (GameConfig.isEditor) {
        this.middleSceneLayer = new DisplaySortableEditorSceneLayer(this.game);
        this.middleSceneLayer.scene = this;
        this.middleSceneLayer.needRealTimeDepthSort = true;
        this.addChild(this.middleSceneLayer);
    } else {
        this.middleSceneLayer = new DisplaySortableSceneLayer(this.game);
        this.middleSceneLayer.scene = this;
        this.middleSceneLayer.needRealTimeDepthSort = true;
        this.addChild(this.middleSceneLayer);
    }


    this.topSceneLayer = new DisplaySortableSceneLayer(this.game);
    this.topSceneLayer.scene = this;
    this.addChild(this.topSceneLayer);
  }

  public addSceneEffect(element: BasicSceneEntity, layer: number  = 1): void {
    if (layer === 1) {
      this.topSceneLayer.addEntity(element);
    } else {
      this.bottomSceneLayer.addEntity(element);
    }
  }

  public removeSceneEffect(element: BasicSceneEntity, layer: number  = 1): void {
    if (layer === 1) {
      this.topSceneLayer.removeEntity(element);
    } else {
      this.bottomSceneLayer.removeEntity(element);
    }
  }

  protected onInitializeScene(value: SceneInfo): void {
    this.mSceneScrollWidth = this.mapSceneInfo.mapTotalWidth;
    this.mSceneScrollHeight = this.mapSceneInfo.mapTotalHeight + Const.GameConst.MAP_TILE_DEPTH;
    this.terrainSceneLayer.onInitialize();
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
    this.removeAllTerrainElements();
    if (this.terrainSceneLayer) {
      this.terrainSceneLayer.onClear();
    }

    if (this.terrainGridLayer) {
      this.terrainGridLayer.clear();
    }

    Globals.MessageCenter.emit(MessageType.SCENE_CLEARED);
  }
}
