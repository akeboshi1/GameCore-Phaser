import {SocketConnection} from "../net/socket";

// World 作为所有模组的全局服务，Hold所有管理对象
export interface IWorldService {
    getConnection(): SocketConnection;
}
