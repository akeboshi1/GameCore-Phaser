import { op_def } from "./node_modules/pixelpai_proto";
export interface IMessage {
    chat: string;
    channel: op_def.ChatChannel;
    color?: string;
}
