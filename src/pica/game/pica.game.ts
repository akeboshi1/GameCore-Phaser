import { ElementStorage } from "baseModel";
import { BaseConfigData, DataManager, Game, HttpService, LoadingManager, MainPeer, RoomManager } from "gamecore";
import { PicaNetworkManager } from "./command/pica.network.manager";
import { BaseDataConfigManager, BaseDataType } from "./data";
import { PicaWorkerUiManager } from "./ui/pica.workeruimanager";

export class PicaGame extends Game {
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
    protected createManager() {
        // 优先初始化datamanager 因为worker全局emitter在datamananger内部初始化
        this.mDataManager = new DataManager(this);
        this.mRoomManager = new RoomManager(this);
        // this.mUiManager = new UiManager(this);
        this.mElementStorage = new ElementStorage();
        this.mUIManager = new PicaWorkerUiManager(this);
        this.mHttpService = new HttpService(this);
        // this.mSoundManager = new SoundManager(this);
        this.mLoadingManager = new LoadingManager(this);
        this.mConfigManager = new BaseDataConfigManager(this);
        this.mNetWorkManager = new PicaNetworkManager(this);
        // this.mPlayerDataManager = new PlayerDataManager(this);
        this.mUIManager.addPackListener();
        this.mRoomManager.addPackListener();
        this.user.addPackListener();
    }
}
