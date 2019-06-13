import { op_client } from "pixelpai_proto";

export interface IBubbleObject {
  addBubble(text: string, bubble: op_client.IChat_Bubble);
}