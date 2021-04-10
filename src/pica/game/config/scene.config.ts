import { BaseConfigData } from "gamecore";
import { IScene } from "../../structureture";
import { Logger } from "utils";
export class SceneConfig extends BaseConfigData {
    public sceneMap: Map<string, IScene[]> = new Map();
    public get(id: string): IScene {
        if (this.hasOwnProperty(id)) {
            return this[id];
        } else {
            Logger.getInstance().error(`Scene表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        // json = this.getjson();
        for (const key in json) {
            const temp = json[key];
            this[key] = temp;
            const subcategory = temp.subcategory || "undefined";
            temp.tag = temp.tag || 0;
            if (this.sceneMap.has(subcategory)) {
                const arr = this.sceneMap.get(subcategory);
                arr.push(temp);
            } else {
                const arr = [];
                arr.push(temp);
                this.sceneMap.set(subcategory, arr);
            }
        }

    }

    // getjson() {
    //     const mine = { "S1200001": { "id": "S1200001", "gameId": "603edcf30e860b07ac5b6723", "sceneId": 1426719378, "functions": [{ "className": "RandomElementGenerator", "args": { "maxNumber": 70, "refreshSettings": [{ "rate": 0.5, "interval": 5, "number": 5 }, { "rate": 0.7, "interval": 10, "number": 5 }, { "rate": 0.99, "interval": 15, "number": 5 }], "weights": [{ "id": "EMINE1000001", "weight": 90 }, { "id": "EMINE1000002", "weight": 25 }, { "id": "EMINE1000003", "weight": 25 }, { "id": "EMINE1000004", "weight": 5 }, { "id": "EMINE1000005", "weight": 5 }, { "id": "EMINE1000006", "weight": 5 }, { "id": "EMINE1000007", "weight": 5 }, { "id": "EMINE1000008", "weight": 5 }, { "id": "EMINE1000009", "weight": 5 }, { "id": "EMINE1000011", "weight": 5 }, { "id": "EMINE1000012", "weight": 5 }, { "id": "EMINE1000013", "weight": 5 }] } }], "roomName": "PKT_S0000011", "roomType": "dungeon", "roomPrivacy": 2, "subcategory": "PKT_SCENE_CATEGORY1", "texturePath": "pkth5/1617673684/stage/quarry" }, "S1200002": { "id": "S1200002", "gameId": "5e9a7dace87abc390c4b1b73", "sceneId": 1228369073, "roomName": "PKT_S0000002", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S1200003": { "id": "S1200003", "gameId": "5e9a7dace87abc390c4b1b73", "sceneId": 1613307910, "roomName": "PKT_S0000003", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S1200004": { "id": "S1200004", "gameId": "5e9a7dace87abc390c4b1b73", "sceneId": 330038958, "roomName": "PKT_S0000004", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S1200005": { "id": "S1200005", "gameId": "5e9a7dace87abc390c4b1b73", "sceneId": 946133189, "roomName": "PKT_S0000005", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S1200006": { "id": "S1200006", "gameId": "5e9a7dace87abc390c4b1b73", "sceneId": 525258354, "roomName": "PKT_S0000006", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S1200007": { "id": "S1200007", "gameId": "5e9a7dace87abc390c4b1b73", "sceneId": 2077279383, "roomName": "PKT_S0000007", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S1200008": { "id": "S1200008", "gameId": "5e9a7dace87abc390c4b1b73", "sceneId": 1574234633, "roomName": "PKT_S0000008", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S1200009": { "id": "S1200009", "gameId": "6007d244eefa6c71caef35cc", "sceneId": 1594726187, "roomName": "PKT_S0000009", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S0021001": { "id": "S0021001", "gameId": "5f4471eebc09541a74d9a0dc", "sceneId": 1067823178, "roomName": "PKT_S0000020", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S0021002": { "id": "S0021002", "gameId": "5f4471eebc09541a74d9a0dc", "sceneId": 390332286, "roomName": "PKT_S0000020", "roomType": "dungeon", "roomPrivacy": 2, "subcategory": "PKT_SCENE_CATEGORY1", "texturePath": "" }, "S0021003": { "id": "S0021003", "gameId": "5f4471eebc09541a74d9a0dc", "sceneId": 742365419, "roomName": "PKT_S0000022", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S0021004": { "id": "S0021004", "gameId": "5f4471eebc09541a74d9a0dc", "sceneId": 270400991, "roomName": "PKT_S0000023", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S0021005": { "id": "S0021005", "gameId": "5f4471eebc09541a74d9a0dc", "sceneId": 1351849678, "roomName": "PKT_S0000024", "roomType": "dungeon", "roomPrivacy": 2, "texturePath": "" }, "S0021006": { "id": "S0021006", "gameId": "6062728046967254e411d726", "sceneId": 690398691, "roomName": "PKT_S0000040", "roomType": "dungeon", "roomPrivacy": 2, "subcategory": "PKT_SCENE_CATEGORY3", "tag": 1, "texturePath": "pkth5/1617673684/stage/game" }, "S0021007": { "id": "S0021007", "gameId": "6063c5bd9ba1917a68bffacf", "sceneId": 943356853, "roomName": "PKT_S0000040", "roomType": "dungeon", "roomPrivacy": 2, "tag": 1, "texturePath": "" }, "S0021008": { "id": "S0021008", "gameId": "600fb77b160d91727fa7f2c7", "sceneId": 1276594436, "roomName": "PKT_S0000042", "roomType": "dungeon", "roomPrivacy": 2, "subcategory": "PKT_SCENE_CATEGORY3", "tag": 1, "texturePath": "pkth5/1617673684/stage/map_toqing_2" }, "S0021009": { "id": "S0021009", "gameId": "5fea8b5b59056d67875186ab", "sceneId": 1726428192, "roomName": "PKT_S0000043", "roomType": "dungeon", "roomPrivacy": 2, "subcategory": "PKT_SCENE_CATEGORY3", "tag": 1, "texturePath": "pkth5/1617673684/stage/map_toqing_1" } };
    //     const pub = { "S0000011": { "id": "S0000011", "gameId": "5e9a7dace87abc390c4b1b73", "sceneId": 12241365, "roomName": "PKT_S0000011", "roomType": "public", "roomPrivacy": 2, "texturePath": "" }, "S0000012": { "id": "S0000012", "gameId": "5e719a0a68196e416ecf7aad", "sceneId": 1278151496, "roomName": "PKT_S0000012", "roomType": "public", "roomPrivacy": 2, "texturePath": "" }, "S0000013": { "id": "S0000013", "gameId": "5e719a0a68196e416ecf7aad", "sceneId": 1024433542, "roomName": "PKT_S0000013", "roomType": "public", "roomPrivacy": 1, "subcategory": "PKT_SCENE_CATEGORY2", "texturePath": "pkth5/1617673684/stage/nlobby" }, "S0000014": { "id": "S0000014", "gameId": "5e719a0a68196e416ecf7aad", "sceneId": 1255596392, "roomName": "PKT_S0000014", "roomType": "public", "roomPrivacy": 1, "subcategory": "PKT_SCENE_CATEGORY1", "texturePath": "pkth5/1617673684/stage/square" }, "S0000015": { "id": "S0000015", "gameId": "6018ca178cb3e9350b58231c", "sceneId": 15980394, "roomName": "PKT_S0000015", "roomType": "public", "roomPrivacy": 2, "texturePath": "" }, "S0000016": { "id": "S0000016", "gameId": "5fc5da5eb5f015137c12bc19", "sceneId": 1279684454, "roomName": "PKT_S0000039", "roomType": "public", "roomPrivacy": 2, "texturePath": "" }, "S0000017": { "id": "S0000017", "gameId": "603f3e179fd165076250bcb3", "sceneId": 73890218, "roomName": "PKT_LN90002", "roomType": "public", "roomPrivacy": 1, "subcategory": "PKT_SCENE_CATEGORY2", "texturePath": "pkth5/1617673684/stage/restaurant" }, "S0000018": { "id": "S0000018", "gameId": "60371c89db27817fd1b8c513", "sceneId": 964620383, "roomName": "PKT_LN90003", "roomType": "public", "roomPrivacy": 1, "subcategory": "PKT_SCENE_CATEGORY2", "texturePath": "pkth5/1617673684/stage/hotspring" }, "S0000019": { "id": "S0000019", "gameId": "60541d4aae92d75fa9162848", "sceneId": 173516608, "roomName": "PKT_LN90004", "roomType": "public", "roomPrivacy": 1, "subcategory": "PKT_SCENE_CATEGORY2", "texturePath": "pkth5/1617673684/stage/sbarber" }, "S0000020": { "id": "S0000020", "gameId": "60546826a960a3603e2923c9", "sceneId": 1933059499, "roomName": "PKT_LN90005", "roomType": "public", "roomPrivacy": 1, "subcategory": "PKT_SCENE_CATEGORY2", "texturePath": "pkth5/1617673684/stage/general_merchandise" }, "S0000021": { "id": "S0000021", "gameId": "60616be8790e5a31b72959c1", "sceneId": 910607345, "roomName": "PKT_S0000041", "roomType": "public", "roomPrivacy": 1, "subcategory": "PKT_SCENE_CATEGORY1", "texturePath": "pkth5/1617673684/stage/shopstreet" }, "S0000022": { "id": "S0000022", "gameId": "5f3cd45c6bf49d3aeee62d2c", "sceneId": 734594801, "roomName": "PKT_S0000034", "roomType": "public", "roomPrivacy": 1, "texturePath": "" }, "S0000023": { "id": "S0000023", "gameId": "5f3e1a66ad2f2e3ad61cd2b7", "sceneId": 706985171, "roomName": "PKT_S0000033", "roomType": "public", "roomPrivacy": 1, "texturePath": "" }, "S0000024": { "id": "S0000024", "gameId": "5f227a915377ef18b109be1e", "sceneId": 43688046, "roomName": "PKT_S0000017", "roomType": "public", "roomPrivacy": 1, "texturePath": "" }, "S0000025": { "id": "S0000025", "gameId": "5f617259afc501467e3b6c30", "sceneId": 1427596229, "roomName": "PKT_S0000018", "roomType": "public", "roomPrivacy": 1, "texturePath": "" }, "S0000026": { "id": "S0000026", "gameId": "5f5ed532afc501467e3b6bf5", "sceneId": 1434536876, "roomName": "PKT_S0000019", "roomType": "public", "roomPrivacy": 1, "texturePath": "" }, "S0000098": { "id": "S0000098", "gameId": "5e719a0a68196e416ecf7aad", "sceneId": 1288553604, "roomName": "PKT_S0000014", "roomType": "public", "roomPrivacy": 1, "texturePath": "" }, "S0000099": { "id": "S0000099", "gameId": "5e719a0a68196e416ecf7aad", "sceneId": 1582755802, "roomName": "PKT_S0000015", "roomType": "public", "roomPrivacy": 1, "texturePath": "" } };
    //     if (this.resName === "mineScene") return mine;
    //     else if (this.resName === "publicScene") return pub;
    // }
}
export class SceneConfigMap {
    sceneMap: Map<string, IScene[]> = new Map();
    public setSceneMap(map: Map<string, IScene[]>, i18nFun: (value: string) => string) {
        this.combineMap(map, i18nFun);
    }
    public getScenes(type?: string, tag?: number) {
        if (tag !== undefined) {
            if (type) {
                const tempArr = this.sceneMap.get(type);
                const gvalue: IScene[] = [];
                for (const value of tempArr) {
                    if (value.tag === tag) gvalue.push(value);
                }
                return gvalue;
            } else {
                const map = new Map();
                this.sceneMap.forEach((tempValue, key) => {
                    const gvalue: IScene[] = [];
                    for (const vv of tempValue) {
                        if (vv.tag === tag) {
                            gvalue.push(vv);
                        }
                    }
                    if (gvalue.length > 0)
                        map.set(key, gvalue);
                });
                return map;
            }
        } else if (type !== undefined) {
            return this.sceneMap.get(type);
        } else return this.sceneMap;
    }
    public sort() {
        const map = this.sceneMap;
        this.sceneMap = new Map();
        const keys: any[] = Array.from(map.keys());
        keys.sort((a, b) => {
            let av = Number(a[a.length - 1]);
            av = isNaN(av) ? Number.MAX_VALUE : av;
            let bv = Number(b[b.length - 1]);
            bv = isNaN(bv) ? Number.MAX_VALUE : bv;
            if (av > bv) return 1;
            else return -1;
        });
        for (const ttkey of keys) {
            this.sceneMap.set(ttkey, map.get(ttkey));
        }
        map.clear();
    }
    private combineMap(fromMap: Map<string, IScene[]>, i18nFun: (value: string) => string) {
        const map = this.sceneMap;
        fromMap.forEach((value, key) => {
            if (map.has(key)) {
                const datas = map.get(key);
                for (const temp of value) {
                    temp.roomName = i18nFun(temp.roomName);
                    datas.push(temp);
                }
            } else {
                const datas = [];
                for (const temp of value) {
                    temp.roomName = i18nFun(temp.roomName);
                    datas.push(temp);
                }
                map.set(key, datas);
            }
        });
    }
}
