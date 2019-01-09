import BaseSingleton from "../../base/BaseSingleton";
import {SceneData} from "../data/SceneData";
import {PlayerData} from "../data/PlayerData";
import {EditorData} from "../data/EditorData";

export class DataCenter extends BaseSingleton {
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
    }

}
