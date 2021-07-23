import { op_client, op_def } from "pixelpai_proto";

export interface ISyncSprite {
    sprite: op_client.ISprite;
    command: op_def.OpCommand;
    patchKeys: string[];
}
