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

    private characterId = 0;
    public setCharacterId(value: number): void {
        this.characterId = value;
        if ( this.initialize === false ) {
            this._initialize = true;
            Globals.MessageCenter.emit(MessageType.PLAYER_DATA_INITIALIZE);
        }
    }

    private _mainPlayerInfo: MainPlayerInfo = new MainPlayerInfo();

    public get mainPlayerInfo(): MainPlayerInfo {
        return this._mainPlayerInfo;
    }

    public setMainPlayerInfo(obj: op_client.IActor): void {
        this.mainPlayerInfo.setInfo(obj)
        if (obj.avatar) {
            this.mainPlayerInfo.changeAvatarModelByModeVO(obj.avatar);
        }
        if (obj.walkOriginPoint) {
            this.mainPlayerInfo.setOriginWalkPoint(obj.walkOriginPoint);
        }
        if (obj.originPoint) {
            this.mainPlayerInfo.setOriginCollisionPoint(obj.originPoint);
        }
    }

    public addPlayer(obj: op_client.IActor): void {
        let playerInfo: PlayerInfo = new PlayerInfo();
        playerInfo.setInfo(obj);
        if (obj.avatar) {
            playerInfo.changeAvatarModelByModeVO(obj.avatar);
        }
        if (obj.walkOriginPoint) {
            playerInfo.setOriginWalkPoint(obj.walkOriginPoint);
        }
        if (obj.originPoint) {
            playerInfo.setOriginCollisionPoint(obj.originPoint);
        }
        this._playerInfoList.push(playerInfo);
        Globals.MessageCenter.emit(MessageType.SCENE_ADD_PLAYER, playerInfo);
    }

    public updatePlayer(obj: op_client.IActor): void {
        let playerInfo: PlayerInfo;
        for (let i: number = this._playerInfoList.length - 1; i >= 0; i--) {
            playerInfo = this._playerInfoList[i];
            if (playerInfo.uuid === obj.uuid) {
                playerInfo.setInfo(obj);
                Globals.MessageCenter.emit(MessageType.SCENE_UPDATE_PLAYER, playerInfo);
                break;
            }
        }
    }

    public removePlayer(uuid: number): void {
        let playerInfo: PlayerInfo;
        for (let i: number = this._playerInfoList.length - 1; i >= 0; i--) {
            playerInfo = this._playerInfoList[i];
            if (playerInfo.uuid === uuid) {
                this._playerInfoList.splice(i, 1);
                Globals.MessageCenter.emit(MessageType.SCENE_REMOVE_PLAYER, uuid);
                break;
            }
        }
    }
}
