import {ServerAddress} from "./address";

export interface ConnectionService {
    startConnect(addr: ServerAddress, keepalive?: boolean): void;

    closeConnect(): void;
}
