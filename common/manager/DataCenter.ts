import BaseSingleton from "../../base/BaseSingleton";
import {SceneData} from "../data/SceneData";
import {PlayerData} from "../data/PlayerData";
import {EditorData} from "../data/EditorData";

export class DataCenter extends BaseSingleton {
    protected serverTime = 0;
    protected now = 0;
    public loginData: Object = {
        "username": "zhangbuxin",
        "time": 1515740032,
        "token": "fd52cf448b092430d7926311245a267e",
        "provider": "fpkt",
        "serverId": 9999
    };

    // {"status":1,"data":{"username":test3966,"accountName":"zhangbuxin","provider":"1001g","_token":{"username":"zhangbuxin","time":1515673836,"token":"cb505b2d1d4287a75891665f083712be"}}}'
    public constructor() {
        super();
    }

    /**
     * 设置服务器当前时间。 毫秒数
     * @return
     */
    public setServerTime(value: number): void {
        this.serverTime = value;
        this.now = new Date().getTime();
    }

    /**
     * 获取当前时间。 毫秒数
     * @return
     */
    public getCurrentTime(): number {
        let d: number = new Date().getTime() - this.now;
        return this.serverTime + d;
    }

    public setLoginParam(obj: any): void {
        let value: any;
        for (let key in obj) {
            value = obj[key];
            if (value instanceof Object) {
                this.setLoginParam(value);
            } else {
                this.loginData[key] = value;
            }
        }
    }

    public get EditorData(): EditorData {
        return EditorData.getInstance();
    }

    public get SceneData(): SceneData {
        return SceneData.getInstance();
    }

    public get PlayerData(): PlayerData {
        return PlayerData.getInstance();
    }

    public dispose(): void {
      this.EditorData.dispose();
      this.SceneData.dispose();
      this.PlayerData.dispose();
      super.dispose();
    }
}
