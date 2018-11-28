import BaseSingleton from "../../base/BaseSingleton";
import {MainPlayerInfo} from "../struct/MainPlayerInfo";
import {PlayerInfo} from "../struct/PlayerInfo";
import {Log} from "../../Log";

export class PlayerData extends BaseSingleton {
    private _playerInfoList: PlayerInfo[] = [];

    public constructor() {
        super();
    }

    private _mainPlayerInfo: MainPlayerInfo = new MainPlayerInfo();

    public get mainPlayerInfo(): MainPlayerInfo {
        return this._mainPlayerInfo;
    }

    public setMainPlayerInfo(obj: any): void {
        let value: any;
        for (let key in obj) {
            value = obj[key];
            if (value instanceof Object) {
                this.setMainPlayerInfo(value);
            } else {
                this._mainPlayerInfo[key] = value;
            }
        }
    }

    public addPlayer(data: Object): PlayerInfo {
        let playerInfo: PlayerInfo = new PlayerInfo();
        // playerInfo.actorId = data["actorId"];
        // playerInfo.nick = data["nick"];
        // playerInfo.sex = data["sex"];
        // playerInfo.moveSpeed = data["moveSpeed"];
        // this.removePlayer(playerInfo.actorId);
        // this._playerInfoList.push(playerInfo);
        // Log.trace("玩家加入，playerID=" + playerInfo.actorId);
        return playerInfo;
    }

    public removePlayer(playerID: number): void {
        let playerInfo: PlayerInfo;
        for (let i: number = this._playerInfoList.length - 1; i >= 0; i--) {
            playerInfo = this._playerInfoList[i];
            if (playerInfo.actorId === playerID) {
                this._playerInfoList.splice(i, 1);
            }
        }
    }
}