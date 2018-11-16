import {SocketConnection, SocketConnectionError} from "./SocketConnection";

export interface IConnectListener {
    onConnected(connection: SocketConnection): void;

    onDisConnected(connection: SocketConnection): void;

    onError(reason: SocketConnectionError | undefined): void;
}