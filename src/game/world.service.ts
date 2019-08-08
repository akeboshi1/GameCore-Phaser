// World 作为所有模组的全局服务，Hold所有管理对象
import {ConnectionService} from "../net/connection.service";
import {ServerAddress} from "../net/address";

export interface WorldService {
    connection: ConnectionService;

    game: Phaser.Game;
}
