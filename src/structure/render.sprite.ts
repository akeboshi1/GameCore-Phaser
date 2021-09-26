import { NodeType } from "./nodetype";
import { IDragonbonesModel } from "./dragonbones";
import { IFramesModel } from "./frame";
import { IPos } from "./logic.pos";
export interface IRenderSprite {
    id: number;
    layer?: number;
    titleMask?: number;
    nickname?: string;
    sound?: string;
    pos?: IPos;
    nodeType?: NodeType;
    attrs?: Map<string, string | number | boolean>;
    hasInteractive?: boolean;
    displayFrame?: IFramesModel | IDragonbonesModel;
    alpha?: number;
}