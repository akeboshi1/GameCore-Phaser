import { op_client } from "pixelpai_proto";
export class PicaPropFunConfig {
    resultHandler: { key: string, confirmFunc: string, cancelFunc?: string, confirmAddData?: any };
    slider?: boolean;
    data: op_client.ICountablePackageItem;
    resource?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE;
    url?: string;
    price?: boolean;
    title?: string;
    line?: boolean;
}
