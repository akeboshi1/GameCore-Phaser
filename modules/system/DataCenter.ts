import BaseSingleton from "../../base/BaseSingleton";
import {MapData} from "../../data/MapData";
import {ElementConfig} from "../../config/ElementConfig";
import {PlayerData} from "../../data/PlayerData";

export class DataCenter extends BaseSingleton {
    public loginData: Object = {
        'username': 'zhangbuxin',
        'time': 1515740032,
        'token': 'fd52cf448b092430d7926311245a267e',
        'provider': 'fpkt',
        'serverId': 9999
    };

    // {"status":1,"data":{"username":test3966,"accountName":"zhangbuxin","provider":"1001g","_token":{"username":"zhangbuxin","time":1515673836,"token":"cb505b2d1d4287a75891665f083712be"}}}'
    public constructor() {
        super();
    }

    public setLoginParam(obj: any): void {
        var value: any;
        for (var key in obj) {
            value = obj[key];
            if (value instanceof Object) {
                this.setLoginParam(value);
            } else {
                this.loginData[key] = value;
            }
        }
    }

    public get MapData(): MapData {
        return MapData.getInstance();
    }

    public get PlayerData(): PlayerData
    {
        return PlayerData.getInstance();
    }

    public get ElementConfig():ElementConfig{
        return ElementConfig.getInstance();
    }

}