import {op_def, op_client} from "pixelpai_proto";
import {IAvatar} from "./dragonbones";

export class AvatarSuitType {
    static avatarSuit: AvatarSuitType;
    static suitPart = {
        "costume": ["body_cost", "body_cost_dres", "farm_cost", "barm_cost", "fleg_cost", "bleg_cost"],
        "hair": ["head_hair", "head_hair_back"],
        "eye": ["head_eyes"],
        "mouse": ["head_mous"],
        "hat": ["head_hats"],
        "mask": ["head_mask"],
        "face": ["head_face"],
        "weapon": ["weap_farm", "weap_barm"],
        "shield": ["shld_farm", "shld_barm"],
        "tail": ["body_tail"],
        "wing": ["body_wing"],
        "helmet": ["head_spec"],
        "shell": ["body_spec", "farm_spec", "barm_spec", "fleg_spec", "bleg_spec"],
        "base": ["head_base", "body_base", "farm_base", "barm_base", "fleg_base", "bleg_base"],
        "scar": ["body_scar"],
        "cloa": ["body_cloa"],
        "chin": ["head_chin"]
    };
    static specHideParts = {
        headSpecId: ["headEyesId", "headHairId", "headMousId", "headHairBackId", "headHatsId", "headMaskId", "headFaceId", "headBaseId"],
        bodySpecId: ["bodyCostId", "bodyCostDresId", "bodyTailId", "bodyWingId", "bodyBaseId"],
        farmSpecId: ["farmCostId", "farmShldId", "farmWeapId", "farmBaseId"],
        barmSpecId: ["barmCostId", "barmShldId", "barmWeapId", "barmBaseId"],
        flegSpecId: ["flegCostId", "flegBaseId"],
        blegSpecId: ["blegCostId", "blegBaseId"]
    };
    static slotBitMap: Map<string, number>;

    static createAvatar(suits: AvatarSuit[], avatar?: any) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        avatar = avatar || {};
        for (const suit of suits) {
            const suitType = this.avatarSuit;
            const allslots = suitType[suit.suit_type];
            const slots = this.checkSlotValue(suit.suit_type, suit.slot);
            for (const tslot of allslots) {
                if (slots.indexOf(tslot) !== -1) {
                    avatar[tslot] = {
                        sn: suit.sn,
                        suit_type: suit.suit_type,
                        slot: suit.slot,
                        tag: suit.tag,
                        version: suit.version
                    };
                } else {
                    avatar[tslot] = {
                        sn: "",
                        suit_type: suit.suit_type,
                        slot: suit.slot,
                        tag: suit.tag,
                        version: suit.version
                    };
                }
            }
        }
        return this.checkSpecHideParts(avatar);
    }

    // 注意传入avatar为引用，会修改其属性值
    static createAvatarBySn(suit_type: string, sn: string, slot: string, tag: string, version?: string, avatar?: any) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        avatar = avatar || {};
        const suitType = this.avatarSuit;
        const allslots = suitType[suit_type];
        const slots = this.checkSlotValue(suit_type, slot);
        for (const tslot of allslots) {
            if (slots.indexOf(tslot) !== -1) {
                avatar[tslot] = {sn, suit_type, slot, tag, version};
            } else {
                avatar[tslot] = {sn: "", suit_type, slot, tag, version};
            }
        }
        return this.checkSpecHideParts(avatar);
    }

    static createHasBaseAvatar(suits: AvatarSuit[]) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        const avatar = this.createBaseAvatar();
        for (const suit of suits) {
            const suitType = this.avatarSuit;
            const allslots = suitType[suit.suit_type];
            if (!allslots) continue;
            const slots = this.checkSlotValue(suit.suit_type, suit.slot);
            for (const tslot of allslots) {
                if (slots.indexOf(tslot) !== -1) {
                    avatar[tslot] = {
                        sn: suit.sn,
                        suit_type: suit.suit_type,
                        slot: suit.slot,
                        tag: suit.tag,
                        version: suit.version
                    };
                } else {
                    avatar[tslot] = {
                        sn: "",
                        suit_type: suit.suit_type,
                        slot: suit.slot,
                        tag: suit.tag,
                        version: suit.version
                    };
                }
            }
        }
        return this.checkSpecHideParts(avatar);
    }

    static createHasBaseAvatarBySn(suit_type: string, sn: string, slot: string, tag: string, version?: string) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        const avatar = this.createBaseAvatar();
        const suitType = this.avatarSuit;
        const allslots = suitType[suit_type];
        const slots = this.checkSlotValue(suit_type, slot);
        for (const tslot of allslots) {
            if (slots.indexOf(tslot) !== -1) {
                avatar[tslot] = {sn, suit_type, slot, tag, version};
            } else {
                avatar[tslot] = {sn: "", suit_type, slot, tag, version};
            }
        }
        return this.checkSpecHideParts(avatar);
    }

    static createBaseAvatar() {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        const avatar: IAvatar = new BaseAvatar();
        return this.checkSpecHideParts(avatar);
    }

    static hasAvatarSuit(attrs: any) {
        if (attrs) {
            for (const attr of attrs) {
                if (attr.key === "PKT_AVATAR_SUITS") {
                    if (attr.value && attr.value.length > 0 && JSON.parse(attr.value).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // resultType: true: avatarKey; false: slotName
    static checkSlotValue(suitType: string, slotbit: string, resultType: boolean = true) {
        if (!this.slotBitMap) {
            this.slotBitMap = new Map();
            const avatarSlot: any = op_def.AvatarSlot;
            for (const key in avatarSlot) {
                if (typeof key === "string") {
                    const humpName = this.toHumpName(key) + "Id";
                    this.slotBitMap.set(humpName, avatarSlot[key]);
                }
            }
        }
        const slotArr = [];
        const suitPart = this.avatarSuit;
        const slots = suitPart[suitType];
        if (!slots) return;
        const slotbits = slotbit === undefined || slotbit === "" ? [] : slotbit.split("#");
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const value = this.slotBitMap.get(slot);
            const bit = 1 << (value % 32);
            const index = Math.floor(value / 32);
            if (slotbits.length > index) {
                const bitstr = slotbits[index];
                const binary = parseInt(atob(bitstr), 10);
                if ((bit & binary) === bit) {
                    slotArr.push(slot);
                }
            } else {
                slotArr.push(slot);
            }
        }
        if (resultType) {
            return slotArr;
        } else {
            return this.toSlotNames(slotArr);
        }
    }

    static toHumpName(str: string) {
        return str.replace(/([^_])(?:_+([^_]))/g, ($0, $1, $2) => {
            return $1 + $2.toUpperCase();
        });
    }

    // 'bodyCostDresId' => 'body_cost_dres'
    static toSlotNames(strs: string[]): string[] {
        const result = [];
        for (const str of strs) {
            const s = this.toSlotName(str);
            result.push(s);
        }
        return result;
    }

    static toSlotName(str: string): string {
        const arr = str.slice(0, -2).split(/(?=[A-Z])/);
        let s = "";
        for (let i = 0; i < arr.length; i++) {
            if (i !== 0) {
                s += "_";
            }
            s += arr[i].toLowerCase();
        }
        return s;
    }

    static getSuitsFromItem(avatarSuits: any[]) {
        const suits: AvatarSuit[] = [];
        for (const item of avatarSuits) {
            const suit: AvatarSuit = {
                id: item.id,
                suit_type: item.suitType,
                slot: item.slot,
                tag: item.tag,
                sn: item.sn,
                version: item.version
            };
            suits.push(suit);
        }
        const avatar = AvatarSuitType.createHasBaseAvatar(suits);
        return {avatar, suits};
    }

    // 检查spec部位，隐藏对应普通部位
    static checkSpecHideParts(avatar: IAvatar) {
        for (const specHidePartsKey in this.specHideParts) {
            if (!this.specHideParts.hasOwnProperty(specHidePartsKey)) continue;
            if (!avatar.hasOwnProperty(specHidePartsKey)) continue;
            const partsNeedHide = this.specHideParts[specHidePartsKey];
            for (const onePart of partsNeedHide) {
                avatar[onePart] = {sn: ""};
            }
        }
        return avatar;
    }

    // IAvatarSet是game-capsule中的数据结构
    static toIAvatarSets(avatar: IAvatar): Array<{ id: string, parts: string[], version?: string }> {
        if (!avatar) return [];
        const setsMap: Map<string, { id: string, parts: string[], version?: string }> = new Map();
        for (const avatarKey in avatar) {
            if (!avatar.hasOwnProperty(avatarKey)) continue;
            if (avatarKey === "id" || avatarKey === "dirable") continue;
            const val = avatar[avatarKey];
            if (val === undefined || val === null) continue;
            let id = "";
            if (typeof val === "string") {
                id = val;
            } else {
                id = val.sn;
            }
            if (id.length === 0) continue;
            const slotName = this.toSlotName(avatarKey);
            if (!setsMap.has(id)) {
                setsMap.set(id, {id, parts: []});
            }
            setsMap.get(id).parts.push(slotName);
            if (typeof val !== "string" && val.version !== undefined && val.version !== null) {
                setsMap.get(id).version = val.version;
            }
        }
        return Array.from(setsMap.values());
    }

    public costume = ["bodyCostId", "bodyCostDresId", "farmCostId", "barmCostId", "flegCostId", "blegCostId"];
    public hair = ["headHairId", "headHairBackId"];
    public eye = ["headEyesId"];
    public mouse = ["headMousId"];
    public hat = ["headHatsId"];
    public mask = ["headMaskId"];
    public face = ["headFaceId"];
    public weapon = ["barmWeapId"];
    public shield = ["farmShldId"];
    public tail = ["bodyTailId"];
    public wing = ["bodyWingId"];
    public helmet = ["headSpecId"];
    // 已和金老板确认，头部特型也加入shell，即装备shell后，会覆盖helmet
    public shell = ["headSpecId", "bodySpecId", "farmSpecId", "barmSpecId", "flegSpecId", "blegSpecId"];
    public baseSuitType = `[{"count":1,"id":"10001","sn":"5cd28238fb073710972a73c2","suit_type":"costume"},{"count":1,"id":"10002","sn":"5cd28238fb073710972a73c2","suit_type":"eye"},{"count":1,"id":"1003","sn":"5cd28238fb073710972a73c2","suit_type":"hair"},{"count":1,"id":"10004","sn":"5cd28238fb073710972a73c2","suit_type":"mouse"}]`;
    public base = ["headBaseId", "bodyBaseId", "farmBaseId", "barmBaseId", "flegBaseId", "blegBaseId"];
    public scar = ["bodyScarId"];
    public cloa = ["bodyCloaId"];
    public chin = ["headChinId"];
}

export class SuitAlternativeType {
    public static suitAlternative: SuitAlternativeType;

    public static checkAlternative(target: string, source: string) {
        this.suitAlternative = this.suitAlternative || new SuitAlternativeType();
        const maskType: number = this.suitAlternative[target];
        const sourceType: number = this.suitAlternative[source];
        const value = maskType & sourceType;
        return value === maskType || value === sourceType;
    }

    public costume = 0x000001;
    public hair = 0x000002;
    public eye = 0x000004;
    public mouse = 0x000008;
    public hat = 0x000010;
    public mask = 0x000020;
    public face = 0x000040;
    public weapon = 0x000080;
    public shield = 0x000100;
    public tail = 0x000200;
    public wing = 0x000400;
    public helmet = 0x0007e;
    public shell = 0x000601;
}

export class BaseAvatar {
    id = "10000";
    barmBaseId = {sn: "0001"};
    blegBaseId = {sn: "0001"};
    bodyBaseId = {sn: "0001"};
    farmBaseId = {sn: "0001"};
    flegBaseId = {sn: "0001"};
    headBaseId = {sn: "0001"};
    headHairId = {sn: "5cd28238fb073710972a73c2"};
    headEyesId = {sn: "5cd28238fb073710972a73c2"};
    headMousId = {sn: "5cd28238fb073710972a73c2"};
    bodyCostId = {sn: "5cd28238fb073710972a73c2"};
}

export interface AvatarSuit {
    id: string;
    sn: string;
    slot: string;
    suit_type: string;
    version?: string;
    tag?: string;
}
