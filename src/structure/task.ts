
import { op_def } from "pixelpai_proto";
export interface Task {
    action: string;
    loc: Partial<op_def.IMossMetaData>;
}
