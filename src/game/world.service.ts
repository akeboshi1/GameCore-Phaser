// World 作为所有模组的全局服务，Hold所有管理对象
import {ConnectionService} from "../net/connection.service";
import {ServerAddress} from "../net/address";
import { SceneType } from "../const/scene.type";
import { KeyBoardManager } from "./keyboard.manager";

export interface WorldService {
    startScene(type: SceneType): void;

    connection: ConnectionService;

    readonly game: Phaser.Game;
}
