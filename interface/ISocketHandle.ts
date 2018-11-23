export interface ISocketHandle {
    addListener(opcode: number, fun: Function): void;
}