import BaseSingleton from "../../base/BaseSingleton";
import {MainPlayerInfo} from "../struct/MainPlayerInfo";
import {PlayerInfo} from "../struct/PlayerInfo";
import {Log} from "../../Log";
import {op_client} from "../../../protocol/protocols";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";
import {GameConfig} from "../../GameConfig";

export class PlayerData extends BaseSingleton {
    private _initialize: boolean = false;
    private _playerInfoList: PlayerInfo[] = [];

    public constructor() {
        super();
    }

    public get initialize(): boolean {
        return this._initialize;
    }

    private _mainPlayerInfo: MainPlayerInfo = new MainPlayerInfo();

    public get mainPlayerInfo(): MainPlayerInfo {
        return this._mainPlayerInfo;
    }

    public setMainPlayerInfo(obj: op_client.ICharacter): void {
        let value: any;
        for (let key in obj) {
            value = obj[key];
            this._mainPlayerInfo[key] = value;
        }
        if (obj.avatar) {
            this.mainPlayerInfo.changeAvatarModelByModeVO(obj.avatar);
        }
        if (obj.walkOriginPoint) {
            this.mainPlayerInfo.setOriginWalkPoint(obj.walkOriginPoint);
        }
        if (obj.originPoint) {
            this.mainPlayerInfo.setOriginCollisionPoint(obj.originPoint);
        }
        if ( this.initialize === false ) {
            this._initialize = true;
            Globals.MessageCenter.emit(MessageType.PLAYER_DATA_INITIALIZE);
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
