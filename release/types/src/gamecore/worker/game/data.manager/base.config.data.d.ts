export declare class BaseConfigData {
    url: string;
    resName: string;
    responseType: XMLHttpRequestResponseType;
    parse(json: string): void;
    parseJson(json: object): void;
}
