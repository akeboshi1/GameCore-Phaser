export class BaseConfigData {
    url: string;
    resName: string;
    responseType: XMLHttpRequestResponseType = "json";
    parse(json: string) {
        const obj = JSON.parse(json);
        Object.assign(this, obj);
    }
    parseJson(json: object) {
        Object.assign(this, json);
    }
}
