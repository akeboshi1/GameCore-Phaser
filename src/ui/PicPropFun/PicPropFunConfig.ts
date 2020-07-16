import { Handler } from "../../Handler/Handler";
import { op_client } from "pixelpai_proto";
export class PicPropFunConfig {
    cancelHandler?: Handler;
    confirmHandler?: Handler;
    slider?: boolean;
    data: op_client.ICountablePackageItem;
    resource?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE;
    price?: boolean;
    title?: string;
}
