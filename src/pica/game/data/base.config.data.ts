export class BaseConfigData {
    parse(json: string) {
        const obj = JSON.parse(json);
        Object.assign(this, obj);
    }
}
