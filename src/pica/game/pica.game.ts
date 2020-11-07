import { DataManager, ElementStorage, Game, HttpService, LoadingManager, MainPeer, RoomManager } from "gamecore";
import { PicaWorkerUiManager } from "./ui/pica.workeruimanager";

export class PicaGame extends Game {
    constructor(peer: MainPeer) {
        super(peer);
    }

    protected createManager() {
        this.mRoomManager = new RoomManager(this);
        // this.mUiManager = new UiManager(this);
        this.mElementStorage = new ElementStorage();
        this.mUIManager = new PicaWorkerUiManager(this);
        this.mHttpService = new HttpService(this);
        // this.mSoundManager = new SoundManager(this);
        this.mLoadingManager = new LoadingManager(this);
        this.mDataManager = new DataManager(this);
        // this.mPlayerDataManager = new PlayerDataManager(this);
        this.mUIManager.addPackListener();
        this.mRoomManager.addPackListener();
        this.user.addPackListener();
    }
}
