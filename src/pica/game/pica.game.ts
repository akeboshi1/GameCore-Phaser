import { ElementStorage } from "baseModel";
import { SoundManager, BaseConfigData, DataManager, Game, HttpService, LoadingManager, MainPeer, RoomManager, CustomProtoManager } from "gamecore";
import { RedEventType } from "picaStructure";
import { HttpLoadManager } from "utils";
import { PicaNetworkManager } from "./command/pica.network.manager";
import { BaseDataConfigManager, BaseDataType } from "./config";
import { PicaGuideManager } from "./guide.manager";
import { RedSystemMananger } from "./red.manager";
import { PicaWorkerUiManager } from "./ui/pica.workeruimanager";

export class PicaGame extends Game {
    protected redManager: RedSystemMananger;
    constructor(peer: MainPeer) {
        super(peer);
    }

    public getBaseConfig<T extends BaseConfigData>(type: BaseDataType) {
        const data = <T>(this.mConfigManager.getConfig(type));
        return data;
    }
    public preloadGameConfig(): Promise<any> {
        return this.mConfigManager.startLoad(this.gameConfigUrl);
    }
    public getRedPoints(type: RedEventType) {
        if (this.redManager) return this.redManager.getRedPoints(type);
        return [];
    }
    protected createManager() {
        // 优先初始化datamanager 因为worker全局emitter在datamananger内部初始化
        this.mDataManager = new DataManager(this);
        this.mRoomManager = new RoomManager(this);
        this.mGuideManager = new PicaGuideManager(this);
        // this.mUiManager = new UiManager(this);
        this.mElementStorage = new ElementStorage();
        this.mUIManager = new PicaWorkerUiManager(this);
        this.mHttpService = new HttpService(this);
        this.mCustomProtoManager = new CustomProtoManager(this);
        this.mSoundManager = new SoundManager(this);
        this.mLoadingManager = new LoadingManager(this);
        this.mConfigManager = new BaseDataConfigManager(this);
        this.mNetWorkManager = new PicaNetworkManager(this);
        this.mHttpLoadManager = new HttpLoadManager();
        this.redManager = new RedSystemMananger(this);
        // this.mPlayerDataManager = new PlayerDataManager(this);
        this.mUIManager.addPackListener();
        this.mRoomManager.addPackListener();
        this.mGuideManager.addPackListener();
        this.user.addPackListener();
        this.mSoundManager.addPackListener();
    }
    protected onClearGame() {
        if (this.redManager) this.redManager.destory();
    }
}
