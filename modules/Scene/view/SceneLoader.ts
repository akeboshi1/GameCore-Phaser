import {Log} from "../../../Log";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import Globals from "../../../Globals";
import "phaser-ce";
import {Sound} from "../../../Assets";
import {Load} from "../../../Assets";
import { Hash } from "crypto";
import { op_gameconfig } from "pixelpai_proto";
import {TerrainInfo} from "../../../common/struct/TerrainInfo";
import {HashMap} from "../../../base/ds/HashMap";

export class SceneLoader {
    public loadStartCallback: Function;
    public loadCompleteCallback: Function;
    public callBackObj: Function;
    private info: SceneInfo;

    public constructor() {
    }

    private loadNum = 0;
    public setLoadCallback(start: Function, complete: Function, thisObj: any): void {
        this.loadStartCallback = start;
        this.loadCompleteCallback = complete;
        this.callBackObj = thisObj;
    }

    /**
     * 切换场景
     * @param euiComponentClass     场景类
     * @param freeRes               是否释放加载的资源（当场景被切换时）
     * @param hideLoadProgress      是否隐藏资源加载进度提示
     */
    public changedToMap(sceneInfo: SceneInfo, freeRes: boolean = true, hideLoadProgress: boolean = false, ): void {
        this.info = sceneInfo;
        // if (Globals.game.cache.checkSoundKey(Sound.BgSound.getName(sceneInfo.bgSound))) {
        //     this.modelLoadCompleteHandler();
        // } else {
        //     Globals.game.load.audio(Sound.BgSound.getName(sceneInfo.bgSound), Sound.BgSound.getUrl(sceneInfo.bgSound));
        //     Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
        //     Globals.game.load.start();
        // }
        let len = this.info.terrainConfig.length;
        let terrain: TerrainInfo;
        let key: string;
        let loadList: HashMap = new HashMap();
        for (let i = 0; i < len; i++) {
            terrain = this.info.terrainConfig[i];
            key = Load.Atlas.getKey(terrain.display.texturePath + terrain.display.dataPath);
            if (!Globals.game.cache.checkImageKey(key) && !loadList.has(key)) {
                loadList.add(key, terrain.display);
            }
        }
        let loader;
        len = loadList.valueList.length;
        let display: op_gameconfig.IDisplay;
        for (let i = 0; i < len; i++) {
            display = loadList.valueList[i];
            ++this.loadNum;
            key = Load.Atlas.getKey(display.texturePath + display.dataPath);
            loader = Globals.LoaderManager.createAtlasLoader(key, Load.Url.getRes(display.texturePath), Load.Url.getRes(display.dataPath));
            loader.onLoadComplete.add(this.modelLoadCompleteHandler, this);
        }
        if (this.loadNum === 0) {
            this.onLoadCompleteHandler();
        }
    }

    protected modelLoadCompleteHandler(): void {
        --this.loadNum;
        if (this.loadNum === 0) {
            this.onLoadCompleteHandler();
        }
    }

    protected onLoadCompleteHandler(): void {
        let cb: Function = this.loadCompleteCallback;
        this.loadCompleteCallback = null;
        cb.apply(this.callBackObj);
        this.callBackObj = null;
    }
}
