import { op_def } from "pixelpai_proto";
export interface IMessage {
    chat: string;
    channel: op_def.ChatChannel;
    color?: string;
}
