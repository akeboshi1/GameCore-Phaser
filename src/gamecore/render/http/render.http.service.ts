import { Render } from "../render";
import { Logger } from "structure";

export class RenderHttpService {
    private api_root: string;
    constructor(private render: Render) {
        this.api_root = render.config.api_root;
    }
    /**
     * 上传人物头像
     * @param url
     */
    uploadHeadImage(url: string) {
        return this.post("update_blob", { file: url });
    }

    // head图片和json 返回值true：远程存在文件，false：远程不存在文件
    headDBTexture(img: string, json: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            Promise.all([this.head(img), this.head(json)])
                .then((statusArr) => {
                    let exit404 = false;
                    for (const status of statusArr) {
                        if (status === 404) {
                            exit404 = true;
                            break;
                        }
                    }
                    resolve(!exit404);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    // head操作在外部执行，这里直接上传
    uploadDBTexture(key: string, url: string, json: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const path = "user_avatar/texture/";
            const imgFullName = path + key + ".png";
            const jsonFullName = path + key + ".json";

            Promise.all([this.post("file_upload_mq", { filename: jsonFullName, blob: json, type: "json" }),
            this.post("file_upload_mq", { filename: imgFullName, blob: url, type: "png" })])
                .then((responses) => {
                    for (const respons of responses) {
                        if (respons.status === 404) {
                            Logger.getInstance().error("file_upload_mq error: ", respons);
                        }
                    }
                    resolve(null);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    userHeadsImage(uids: string[]) {
        return this.get(`account/get_head_img?uids=${JSON.stringify(uids)}`);
    }
    public post(uri: string, body: any, headers?: any): Promise<any> {
        const account = this.render.getAccount();
        if (!account) {
            return Promise.reject("account does not exist");
        }
        const accountData = account.accountData;
        // if (!accountData) {
        //     return Promise.reject("token does not exist");
        // }
        headers = Object.assign({
            "Content-Type": "application/json",
            "X-Pixelpai-TK": accountData ? accountData.accessToken : undefined
        }, headers);
        const data = {
            body: JSON.stringify(body),
            method: "POST",
            headers,
        };
        // Logger.getInstance().debug("#post ", `${this.api_root}${uri}`, data);
        return fetch(`${this.api_root}${uri}`, data).then((response) => response.json());
    }

    public async head(url: string): Promise<number> {
        const data = {
            method: "HEAD"
        };
        return fetch(url, data).then((response) => response.status);
    }

    public get(uri: string) {
        return new Promise((resolve, reject) => {
            const account = this.render.getAccount()
            if (!account) {
                return reject("account does not exist");
            }
            const accountData = account.accountData;
            if (!accountData) {
                return reject("token does not exist");
            }
            const data = {
                method: "GET",
                headers: {
                    "X-Pixelpai-TK": accountData.accessToken
                }
            };
            resolve(fetch(`${this.api_root}${uri}`, data).then((response) => response.json()));
        });
    }
}
