import {Log} from "../../../Log";
import {SceneInfo} from "../../../common/struct/SceneInfo";

export class SceneLoader {
    public loadStartCallback: Function;
    public loadCompleteCallback: Function;
    public callBackObj: Function;
    private mId: number;

    public constructor() {
    }

    public setLoadCallback(start: Function, complete: Function, thisObj: any): void {
        this.loadStartCallback = start;
        this.loadCompleteCallback = complete;
        this.callBackObj = thisObj;
    }

    /**
     * 切换场景
     * @param euiComponentClass     场景类
     * @param resGroupName          资源组名称
     * @param freeRes               是否释放加载的资源（当场景被切换时）
     * @param hideLoadProgress      是否隐藏资源加载进度提示
     */
    public changedToMap(mapId: number = 0, freeRes: boolean = true, hideLoadProgress: boolean = false, ): void {
        // this.mId = mapId;
        // if (Globals.game.cache.checkJSONKey(mapId + "_json")) {
        //     this.modelLoadCompleteHandler();
        // } else {
        //     Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
        //     Globals.game.load.json(mapId + "_json", Jsons.JsonMap.getJSON(mapId));
        // }
    }

    public getMapSceneInfo(mapId: number, mapConfig: any): SceneInfo {
        Log.trace("Scene mapConfig:" + mapId);
        let mapSceneInfo: SceneInfo = new SceneInfo();

        // mapSceneInfo.mapId = mapId;
        // mapSceneInfo.setTmx(mapConfig);
        //
        // Globals.DataCenter.MapData.setMapInfo(mapSceneInfo);

        return mapSceneInfo;
    }

    protected modelLoadCompleteHandler(): void {

        // let sceneInfo: SceneInfo = this.getMapSceneInfo(this.mId, Globals.game.cache.getJSON(this.mId + "_json"));
        //
        // if (this.loadCompleteCallback != null) this.loadCompleteCallback.apply(this.callBackObj, [sceneInfo]);
    }
}