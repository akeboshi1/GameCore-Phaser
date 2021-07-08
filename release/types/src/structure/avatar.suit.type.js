import { op_def } from "pixelpai_proto";
var AvatarSuitType = /** @class */ (function () {
    function AvatarSuitType() {
        this.costume = ["bodyCostId", "bodyCostDresId", "farmCostId", "barmCostId", "flegCostId", "blegCostId"];
        this.hair = ["headHairId", "headHairBackId"];
        this.eye = ["headEyesId"];
        this.mouse = ["headMousId"];
        this.hat = ["headHatsId"];
        this.mask = ["headMaskId"];
        this.face = ["headFaceId"];
        this.weapon = ["barmWeapId"];
        this.shield = ["farmShldId"];
        this.tail = ["bodyTailId"];
        this.wing = ["bodyWingId"];
        this.helmet = ["headSpecId"];
        // 已和金老板确认，头部特型也加入shell，即装备shell后，会覆盖helmet
        this.shell = ["headSpecId", "bodySpecId", "farmSpecId", "barmSpecId", "flegSpecId", "blegSpecId"];
        this.baseSuitType = "[{\"count\":1,\"id\":\"10001\",\"sn\":\"5cd28238fb073710972a73c2\",\"suit_type\":\"costume\"},{\"count\":1,\"id\":\"10002\",\"sn\":\"5cd28238fb073710972a73c2\",\"suit_type\":\"eye\"},{\"count\":1,\"id\":\"1003\",\"sn\":\"5cd28238fb073710972a73c2\",\"suit_type\":\"hair\"},{\"count\":1,\"id\":\"10004\",\"sn\":\"5cd28238fb073710972a73c2\",\"suit_type\":\"mouse\"}]";
        this.base = ["headBaseId", "bodyBaseId", "farmBaseId", "barmBaseId", "flegBaseId", "blegBaseId"];
        this.scar = ["bodyScarId"];
        this.cloa = ["bodyCloaId"];
        this.chin = ["headChinId"];
    }
    AvatarSuitType.createAvatar = function (suits, avatar) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        avatar = avatar || {};
        for (var _i = 0, suits_1 = suits; _i < suits_1.length; _i++) {
            var suit = suits_1[_i];
            var suitType = this.avatarSuit;
            var allslots = suitType[suit.suit_type];
            var slots = this.checkSlotValue(suit.suit_type, suit.slot);
            for (var _a = 0, allslots_1 = allslots; _a < allslots_1.length; _a++) {
                var tslot = allslots_1[_a];
                if (slots.indexOf(tslot) !== -1) {
                    avatar[tslot] = {
                        sn: suit.sn,
                        suit_type: suit.suit_type,
                        slot: suit.slot,
                        tag: suit.tag,
                        version: suit.version
                    };
                }
                else {
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
    };
    // 注意传入avatar为引用，会修改其属性值
    AvatarSuitType.createAvatarBySn = function (suit_type, sn, slot, tag, version, avatar) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        avatar = avatar || {};
        var suitType = this.avatarSuit;
        var allslots = suitType[suit_type];
        var slots = this.checkSlotValue(suit_type, slot);
        for (var _i = 0, allslots_2 = allslots; _i < allslots_2.length; _i++) {
            var tslot = allslots_2[_i];
            if (slots.indexOf(tslot) !== -1) {
                avatar[tslot] = { sn: sn, suit_type: suit_type, slot: slot, tag: tag, version: version };
            }
            else {
                avatar[tslot] = { sn: "", suit_type: suit_type, slot: slot, tag: tag, version: version };
            }
        }
        return this.checkSpecHideParts(avatar);
    };
    AvatarSuitType.createHasBaseAvatar = function (suits) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        var avatar = this.createBaseAvatar();
        for (var _i = 0, suits_2 = suits; _i < suits_2.length; _i++) {
            var suit = suits_2[_i];
            var suitType = this.avatarSuit;
            var allslots = suitType[suit.suit_type];
            if (!allslots)
                continue;
            var slots = this.checkSlotValue(suit.suit_type, suit.slot);
            for (var _a = 0, allslots_3 = allslots; _a < allslots_3.length; _a++) {
                var tslot = allslots_3[_a];
                if (slots.indexOf(tslot) !== -1) {
                    avatar[tslot] = {
                        sn: suit.sn,
                        suit_type: suit.suit_type,
                        slot: suit.slot,
                        tag: suit.tag,
                        version: suit.version
                    };
                }
                else {
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
    };
    AvatarSuitType.createHasBaseAvatarBySn = function (suit_type, sn, slot, tag, version) {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        var avatar = this.createBaseAvatar();
        var suitType = this.avatarSuit;
        var allslots = suitType[suit_type];
        var slots = this.checkSlotValue(suit_type, slot);
        for (var _i = 0, allslots_4 = allslots; _i < allslots_4.length; _i++) {
            var tslot = allslots_4[_i];
            if (slots.indexOf(tslot) !== -1) {
                avatar[tslot] = { sn: sn, suit_type: suit_type, slot: slot, tag: tag, version: version };
            }
            else {
                avatar[tslot] = { sn: "", suit_type: suit_type, slot: slot, tag: tag, version: version };
            }
        }
        return this.checkSpecHideParts(avatar);
    };
    AvatarSuitType.createBaseAvatar = function () {
        this.avatarSuit = this.avatarSuit || new AvatarSuitType();
        var avatar = new BaseAvatar();
        return this.checkSpecHideParts(avatar);
    };
    AvatarSuitType.hasAvatarSuit = function (attrs) {
        if (attrs) {
            for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
                var attr = attrs_1[_i];
                if (attr.key === "PKT_AVATAR_SUITS") {
                    if (attr.value && attr.value.length > 0 && JSON.parse(attr.value).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    // resultType: true: avatarKey; false: slotName
    AvatarSuitType.checkSlotValue = function (suitType, slotbit, resultType) {
        if (resultType === void 0) { resultType = true; }
        if (!this.slotBitMap) {
            this.slotBitMap = new Map();
            var avatarSlot = op_def.AvatarSlot;
            for (var key in avatarSlot) {
                if (typeof key === "string") {
                    var humpName = this.toHumpName(key) + "Id";
                    this.slotBitMap.set(humpName, avatarSlot[key]);
                }
            }
        }
        var slotArr = [];
        var suitPart = this.avatarSuit;
        var slots = suitPart[suitType];
        if (!slots)
            return;
        var slotbits = slotbit === undefined || slotbit === "" ? [] : slotbit.split("#");
        // tslint:disable-next-line:prefer-for-of
        for (var i = 0; i < slots.length; i++) {
            var slot = slots[i];
            var value = this.slotBitMap.get(slot);
            var bit = 1 << (value % 32);
            var index = Math.floor(value / 32);
            if (slotbits.length > index) {
                var bitstr = slotbits[index];
                var binary = parseInt(atob(bitstr), 10);
                if ((bit & binary) === bit) {
                    slotArr.push(slot);
                }
            }
            else {
                slotArr.push(slot);
            }
        }
        if (resultType) {
            return slotArr;
        }
        else {
            return this.toSlotNames(slotArr);
        }
    };
    AvatarSuitType.toHumpName = function (str) {
        return str.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
            return $1 + $2.toUpperCase();
        });
    };
    // 'bodyCostDresId' => 'body_cost_dres'
    AvatarSuitType.toSlotNames = function (strs) {
        var result = [];
        for (var _i = 0, strs_1 = strs; _i < strs_1.length; _i++) {
            var str = strs_1[_i];
            var s = this.toSlotName(str);
            result.push(s);
        }
        return result;
    };
    AvatarSuitType.toSlotName = function (str) {
        var arr = str.slice(0, -2).split(/(?=[A-Z])/);
        var s = "";
        for (var i = 0; i < arr.length; i++) {
            if (i !== 0) {
                s += "_";
            }
            s += arr[i].toLowerCase();
        }
        return s;
    };
    AvatarSuitType.getSuitsFromItem = function (avatarSuits) {
        var suits = [];
        for (var _i = 0, avatarSuits_1 = avatarSuits; _i < avatarSuits_1.length; _i++) {
            var item = avatarSuits_1[_i];
            var suit = {
                id: item.id,
                suit_type: item.suitType,
                slot: item.slot,
                tag: item.tag,
                sn: item.sn,
                version: item.version
            };
            suits.push(suit);
        }
        var avatar = AvatarSuitType.createHasBaseAvatar(suits);
        return { avatar: avatar, suits: suits };
    };
    // 检查spec部位，隐藏对应普通部位
    AvatarSuitType.checkSpecHideParts = function (avatar) {
        for (var specHidePartsKey in this.specHideParts) {
            if (!this.specHideParts.hasOwnProperty(specHidePartsKey))
                continue;
            if (!avatar.hasOwnProperty(specHidePartsKey))
                continue;
            var partsNeedHide = this.specHideParts[specHidePartsKey];
            for (var _i = 0, partsNeedHide_1 = partsNeedHide; _i < partsNeedHide_1.length; _i++) {
                var onePart = partsNeedHide_1[_i];
                avatar[onePart] = { sn: "" };
            }
        }
        return avatar;
    };
    // IAvatarSet是game-capsule中的数据结构
    AvatarSuitType.toIAvatarSets = function (avatar) {
        if (!avatar)
            return [];
        var setsMap = new Map();
        for (var avatarKey in avatar) {
            if (!avatar.hasOwnProperty(avatarKey))
                continue;
            if (avatarKey === "id" || avatarKey === "dirable")
                continue;
            var val = avatar[avatarKey];
            if (val === undefined || val === null)
                continue;
            var id = "";
            if (typeof val === "string") {
                id = val;
            }
            else {
                id = val.sn;
            }
            if (id.length === 0)
                continue;
            var slotName = this.toSlotName(avatarKey);
            if (!setsMap.has(id)) {
                setsMap.set(id, { id: id, parts: [] });
            }
            setsMap.get(id).parts.push(slotName);
            if (typeof val !== "string" && val.version !== undefined && val.version !== null) {
                setsMap.get(id).version = val.version;
            }
        }
        return Array.from(setsMap.values());
    };
    AvatarSuitType.suitPart = {
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
    AvatarSuitType.specHideParts = {
        headSpecId: ["headEyesId", "headHairId", "headMousId", "headHairBackId", "headHatsId", "headMaskId", "headFaceId", "headBaseId"],
        bodySpecId: ["bodyCostId", "bodyCostDresId", "bodyTailId", "bodyWingId", "bodyBaseId"],
        farmSpecId: ["farmCostId", "farmShldId", "farmWeapId", "farmBaseId"],
        barmSpecId: ["barmCostId", "barmShldId", "barmWeapId", "barmBaseId"],
        flegSpecId: ["flegCostId", "flegBaseId"],
        blegSpecId: ["blegCostId", "blegBaseId"]
    };
    return AvatarSuitType;
}());
export { AvatarSuitType };
var SuitAlternativeType = /** @class */ (function () {
    function SuitAlternativeType() {
        this.costume = 0x000001;
        this.hair = 0x000002;
        this.eye = 0x000004;
        this.mouse = 0x000008;
        this.hat = 0x000010;
        this.mask = 0x000020;
        this.face = 0x000040;
        this.weapon = 0x000080;
        this.shield = 0x000100;
        this.tail = 0x000200;
        this.wing = 0x000400;
        this.helmet = 0x0007e;
        this.shell = 0x000601;
    }
    SuitAlternativeType.checkAlternative = function (target, source) {
        this.suitAlternative = this.suitAlternative || new SuitAlternativeType();
        var maskType = this.suitAlternative[target];
        var sourceType = this.suitAlternative[source];
        var value = maskType & sourceType;
        return value === maskType || value === sourceType;
    };
    return SuitAlternativeType;
}());
export { SuitAlternativeType };
var BaseAvatar = /** @class */ (function () {
    function BaseAvatar() {
        this.id = "10000";
        this.barmBaseId = { sn: "0001" };
        this.blegBaseId = { sn: "0001" };
        this.bodyBaseId = { sn: "0001" };
        this.farmBaseId = { sn: "0001" };
        this.flegBaseId = { sn: "0001" };
        this.headBaseId = { sn: "0001" };
        this.headHairId = { sn: "5cd28238fb073710972a73c2" };
        this.headEyesId = { sn: "5cd28238fb073710972a73c2" };
        this.headMousId = { sn: "5cd28238fb073710972a73c2" };
        this.bodyCostId = { sn: "5cd28238fb073710972a73c2" };
    }
    return BaseAvatar;
}());
export { BaseAvatar };
//# sourceMappingURL=avatar.suit.type.js.map