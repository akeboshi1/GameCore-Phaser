import { PlayerInfo } from "./playerInfo";
import { MainPlayerInfo } from "./mainPlayerInfo";
import { op_client, op_gameconfig } from "pixelpai_proto";
import { MessageType } from "../../const/MessageType";
import { IBaseModel } from "../baseModel";
import { WorldService } from "../../game/world.service";
import { PacketHandler } from "net-socket-packet";

export class PlayerDataModel implements IBaseModel {
    // private mCharactId: number;
    public static NAME: string = "PlayerDataModel";
    public initialize: boolean = false;
    private mPlayerInfoList: PlayerInfo[] = [];
    private mMainPlayerInfo: MainPlayerInfo = new MainPlayerInfo();
    private mModelDispatch: Phaser.Events.EventEmitter;

    constructor(private mWorld: WorldService) {
        if (this.mWorld.modelManager) {
            this.mModelDispatch = this.mWorld.modelManager;
        }
    }

    public getInitialize(): boolean {
        return this.initialize;
    }

    // public setCharacterId(value: number): void {
    //     this.mCharactId = value;
    // }

    // public getCharacterId(): number {
    //     return this.mCharactId;
    // }

    public get mainPlayerInfo(): MainPlayerInfo {
        return this.mMainPlayerInfo;
    }

    public setmainPlayerInfo(obj: op_client.IActor): void {
        this.mMainPlayerInfo.setInfo(obj);
        if (obj.walkOriginPoint) {
            this.mMainPlayerInfo.setOriginWalkPoint(obj.walkOriginPoint);
        }
        if (obj.originPoint) {
            this.mMainPlayerInfo.setOriginCollisionPoint(obj.originPoint);
        }
        if (this.getInitialize() === false) {
            this.initialize = true;
            this.mModelDispatch.emit(MessageType.PLAYER_DATA_INITIALIZE);
        }
    }

    public addPlayer(obj: op_client.IActor): void {
        const playerInfo: PlayerInfo = new PlayerInfo();
        playerInfo.setInfo(obj);
        if (obj.walkOriginPoint) {
            playerInfo.setOriginWalkPoint(obj.walkOriginPoint);
        }
        if (obj.originPoint) {
            playerInfo.setOriginCollisionPoint(obj.originPoint);
        }
        this.mPlayerInfoList.push(playerInfo);
        this.mModelDispatch.emit(MessageType.SCENE_ADD_PLAYER, playerInfo);
    }

    public updatePlayer(obj: op_client.IActor): void {
        let playerInfo: PlayerInfo;
        if (this.mMainPlayerInfo.uuid === obj.uuid) {
            this.mMainPlayerInfo.setInfo(obj);
            this.mModelDispatch.emit(MessageType.SCENE_UPDATE_PLAYER, this.mMainPlayerInfo);
            return;
        }
        for (let i: number = this.mPlayerInfoList.length - 1; i >= 0; i--) {
            playerInfo = this.mPlayerInfoList[i];
            if (playerInfo.uuid === obj.uuid) {
                playerInfo.setInfo(obj);
                this.mModelDispatch.emit(MessageType.SCENE_UPDATE_PLAYER, playerInfo);
                break;
            }
        }
    }

    public removePlayer(uuid: number): void {
        let playerInfo: PlayerInfo;
        if (this.mMainPlayerInfo.uuid === uuid) {
            this.mModelDispatch.emit(MessageType.SCENE_REMOVE_PLAYER, uuid);
            return;
        }
        for (let i: number = this.mPlayerInfoList.length - 1; i >= 0; i--) {
            playerInfo = this.mPlayerInfoList[i];
            if (playerInfo.uuid === uuid) {
                this.mPlayerInfoList.splice(i, 1);
                this.mModelDispatch.emit(MessageType.SCENE_REMOVE_PLAYER, uuid);
                break;
            }
        }
    }

    public addPackItems(elementId: number, items: op_gameconfig.IItem[]): void {
        const character = this.getPlayer(elementId);
        if (character) {
            if (!character.package) {
                character.package = [];
                character.package[0] = op_gameconfig.Package.create();
            }
            character.package[0].items = character.package[0].items.concat(items);
            if (character === this.mMainPlayerInfo) {
                this.mModelDispatch.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
            }
        }
    }

    public removePackItems(elementId: number, itemId: number): boolean {
        const character = this.getPlayer(elementId);
        if (character) {
            const len = character.package[0].items.length;
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
        const player = this.mPlayerInfoList.find((info: PlayerInfo) => {
            return info.id === uuid;
        });
        if (!!player === false) {
            if (uuid === this.mMainPlayerInfo.id) return this.mMainPlayerInfo;
        }
        return player;
    }

    get playInfoList(): PlayerInfo[] {
        return this.mPlayerInfoList;
    }

}
