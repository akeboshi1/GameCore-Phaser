import {Log} from "../../../Log";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import Globals from "../../../Globals";
import "phaser-ce";
import {Sound} from "../../../Assets";

export class SceneLoader {
    public loadStartCallback: Function;
    public loadCompleteCallback: Function;
    public callBackObj: Function;
    private info: SceneInfo;

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
     * @param freeRes               是否释放加载的资源（当场景被切换时）
     * @param hideLoadProgress      是否隐藏资源加载进度提示
     */
    public changedToMap(sceneInfo: SceneInfo, freeRes: boolean = true, hideLoadProgress: boolean = false, ): void {
        this.info = sceneInfo;
        if (Globals.game.cache.checkSoundKey(Sound.BgSound.getName(sceneInfo.bgSound))) {
            this.modelLoadCompleteHandler();
        } else {
            Globals.game.load.audio(Sound.BgSound.getName(sceneInfo.bgSound), Sound.BgSound.getUrl(sceneInfo.bgSound));
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            Globals.game.load.start();
        }
    }

    protected modelLoadCompleteHandler(): void {
        Log.trace("Scene加载完成");
        if (this.loadCompleteCallback != null) this.loadCompleteCallback.apply(this.callBackObj);
    }
}