import BaseSingleton from "../base/BaseSingleton";
import {MainPlayerInfo} from "../struct/MainPlayerInfo";
import {PlayerInfo} from "../struct/PlayerInfo";
import {Log} from "../Log";

export class PlayerData extends BaseSingleton {
	private _mainPlayerInfo: MainPlayerInfo = new MainPlayerInfo();
	private _playerInfoList: PlayerInfo[] = [];
	public constructor() {
		super();
	}

	public get mainPlayerInfo(): MainPlayerInfo {
		return this._mainPlayerInfo;
	}

	public setMainPlayerInfo(obj: any): void {
		var value: any;
		for (var key in obj) {
			value = obj[key];
			if (value instanceof Object) {
				this.setMainPlayerInfo(value);
			} else {
				this._mainPlayerInfo[key] = value;
			}
		}
	}

	public addPlayer(data: Object): PlayerInfo {
		var playerInfo: PlayerInfo = new PlayerInfo();
		playerInfo.playerID = data["playerId"];
		playerInfo.nick = data["nick"];
		playerInfo.sex = data["sex"];
		playerInfo.moveSpeed = data["moveSpeed"];
		this.removePlayer(playerInfo.playerID);
		this._playerInfoList.push(playerInfo);
		Log.trace("玩家加入，playerID=" + playerInfo.playerID);
		return playerInfo;
	}

	public removePlayer(playerID: number): void {
		var playerInfo: PlayerInfo;
		for (var i: number = this._playerInfoList.length - 1; i >= 0; i--) {
			playerInfo = this._playerInfoList[i];
			if (playerInfo.playerID == playerID) {
				this._playerInfoList.splice(i, 1);
			}
		}
	}
}