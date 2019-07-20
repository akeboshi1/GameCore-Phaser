import BaseSingleton from "../../base/BaseSingleton";
import {MainPlayerInfo} from "../struct/MainPlayerInfo";
import {PlayerInfo} from "../struct/PlayerInfo";
import {op_client, op_gameconfig} from "pixelpai_proto";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";

export class PlayerData extends BaseSingleton {
    private _initialize: boolean = false;
    private _playerInfoList: PlayerInfo[] = [];

    public constructor() {
        super();
    }

    public get initialize(): boolean {
        return this._initialize;
    }

    public characterId = 0;
    public setCharacterId(value: number): void {
        this.characterId = value;
        Globals.MessageCenter.emit(MessageType.PLAYER_SELECT_CHARACTER);
    }

    private _mainPlayerInfo: MainPlayerInfo = new MainPlayerInfo();

    public get mainPlayerInfo(): MainPlayerInfo {
        return this._mainPlayerInfo;
    }

    public setMainPlayerInfo(obj: op_client.IActor): void {
        this.mainPlayerInfo.setInfo(obj);
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

    public addPlayer(obj: op_client.IActor): void {
        let playerInfo: PlayerInfo = new PlayerInfo();
        playerInfo.setInfo(obj);
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
        if (this._mainPlayerInfo.uuid === obj.uuid) {
            this._mainPlayerInfo.setInfo(obj);
            Globals.MessageCenter.emit(MessageType.SCENE_UPDATE_PLAYER, this._mainPlayerInfo);
            return;
        }
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
        if (this._mainPlayerInfo.uuid === uuid) {
            Globals.MessageCenter.emit(MessageType.SCENE_REMOVE_PLAYER, uuid);
            return;
        }
        for (let i: number = this._playerInfoList.length - 1; i >= 0; i--) {
            playerInfo = this._playerInfoList[i];
            if (playerInfo.uuid === uuid) {
                this._playerInfoList.splice(i, 1);
                Globals.MessageCenter.emit(MessageType.SCENE_REMOVE_PLAYER, uuid);
                break;
            }
        }
    }

    public addCharacterPackItems(elementId: number, items: op_gameconfig.IItem[]): void {
        let character = this.getPlayer(elementId);
        if (character) {
            if (!character.package) {
                character.package = [];
                character.package[0] = op_gameconfig.Package.create();
                // element.package = op_gameconfig.Package.create();
            }
            character.package[0].items = character.package[0].items.concat(items);
            if (character === this.mainPlayerInfo) {
                Globals.MessageCenter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
            }
        }
    }

    public removeCharacterPackItems(elementId: number, itemId: number): boolean {
        let character = this.getPlayer(elementId);
        if (character) {
            let len = character.package[0].items.length;
            for (let i = 0; i < len; i++) {
                if (itemId === character.package[0].items[i].id) {
                    character.package[0].items.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    public getPlayer(uuid: number) {
        let player =  this._playerInfoList.find(player => player.id === uuid);
        if (!!player === false) {
            if (uuid === this._mainPlayerInfo.id) return this._mainPlayerInfo;
        }
        return player;
    }

    get playInfoList(): PlayerInfo[] {
        return this._playerInfoList;
    }
}
