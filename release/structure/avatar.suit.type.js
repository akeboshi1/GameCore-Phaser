var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { op_def } from "pixelpai_proto";
const _AvatarSuitType = class {
  constructor() {
    __publicField(this, "costume", ["bodyCostId", "bodyCostDresId", "farmCostId", "barmCostId", "flegCostId", "blegCostId"]);
    __publicField(this, "hair", ["headHairId", "headHairBackId"]);
    __publicField(this, "eye", ["headEyesId"]);
    __publicField(this, "mouse", ["headMousId"]);
    __publicField(this, "hat", ["headHatsId"]);
    __publicField(this, "mask", ["headMaskId"]);
    __publicField(this, "face", ["headFaceId"]);
    __publicField(this, "weapon", ["barmWeapId"]);
    __publicField(this, "shield", ["farmShldId"]);
    __publicField(this, "tail", ["bodyTailId"]);
    __publicField(this, "wing", ["bodyWingId"]);
    __publicField(this, "helmet", ["headSpecId"]);
    __publicField(this, "shell", ["headSpecId", "bodySpecId", "farmSpecId", "barmSpecId", "flegSpecId", "blegSpecId"]);
    __publicField(this, "baseSuitType", `[{"count":1,"id":"10001","sn":"5cd28238fb073710972a73c2","suit_type":"costume"},{"count":1,"id":"10002","sn":"5cd28238fb073710972a73c2","suit_type":"eye"},{"count":1,"id":"1003","sn":"5cd28238fb073710972a73c2","suit_type":"hair"},{"count":1,"id":"10004","sn":"5cd28238fb073710972a73c2","suit_type":"mouse"}]`);
    __publicField(this, "base", ["headBaseId", "bodyBaseId", "farmBaseId", "barmBaseId", "flegBaseId", "blegBaseId"]);
    __publicField(this, "scar", ["bodyScarId"]);
    __publicField(this, "cloa", ["bodyCloaId"]);
    __publicField(this, "chin", ["headChinId"]);
  }
  static createAvatar(suits, avatar) {
    this.avatarSuit = this.avatarSuit || new _AvatarSuitType();
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
  static createAvatarBySn(suit_type, sn, slot, tag, version, avatar) {
    this.avatarSuit = this.avatarSuit || new _AvatarSuitType();
    avatar = avatar || {};
    const suitType = this.avatarSuit;
    const allslots = suitType[suit_type];
    const slots = this.checkSlotValue(suit_type, slot);
    for (const tslot of allslots) {
      if (slots.indexOf(tslot) !== -1) {
        avatar[tslot] = { sn, suit_type, slot, tag, version };
      } else {
        avatar[tslot] = { sn: "", suit_type, slot, tag, version };
      }
    }
    return this.checkSpecHideParts(avatar);
  }
  static createHasBaseAvatar(suits) {
    this.avatarSuit = this.avatarSuit || new _AvatarSuitType();
    const avatar = this.createBaseAvatar();
    for (const suit of suits) {
      const suitType = this.avatarSuit;
      const allslots = suitType[suit.suit_type];
      if (!allslots)
        continue;
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
  static createHasBaseAvatarBySn(suit_type, sn, slot, tag, version) {
    this.avatarSuit = this.avatarSuit || new _AvatarSuitType();
    const avatar = this.createBaseAvatar();
    const suitType = this.avatarSuit;
    const allslots = suitType[suit_type];
    const slots = this.checkSlotValue(suit_type, slot);
    for (const tslot of allslots) {
      if (slots.indexOf(tslot) !== -1) {
        avatar[tslot] = { sn, suit_type, slot, tag, version };
      } else {
        avatar[tslot] = { sn: "", suit_type, slot, tag, version };
      }
    }
    return this.checkSpecHideParts(avatar);
  }
  static createBaseAvatar() {
    this.avatarSuit = this.avatarSuit || new _AvatarSuitType();
    const avatar = new BaseAvatar();
    return this.checkSpecHideParts(avatar);
  }
  static hasAvatarSuit(attrs) {
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
  static checkSlotValue(suitType, slotbit, resultType = true) {
    if (!this.slotBitMap) {
      this.slotBitMap = new Map();
      const avatarSlot = op_def.AvatarSlot;
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
    if (!slots)
      return;
    const slotbits = slotbit === void 0 || slotbit === "" ? [] : slotbit.split("#");
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const value = this.slotBitMap.get(slot);
      const bit = 1 << value % 32;
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
  static toHumpName(str) {
    return str.replace(/([^_])(?:_+([^_]))/g, ($0, $1, $2) => {
      return $1 + $2.toUpperCase();
    });
  }
  static toSlotNames(strs) {
    const result = [];
    for (const str of strs) {
      const s = this.toSlotName(str);
      result.push(s);
    }
    return result;
  }
  static toSlotName(str) {
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
  static getSuitsFromItem(avatarSuits) {
    const suits = [];
    for (const item of avatarSuits) {
      const suit = {
        id: item.id,
        suit_type: item.suitType,
        slot: item.slot,
        tag: item.tag,
        sn: item.sn,
        version: item.version
      };
      suits.push(suit);
    }
    const avatar = _AvatarSuitType.createHasBaseAvatar(suits);
    return { avatar, suits };
  }
  static checkSpecHideParts(avatar) {
    for (const specHidePartsKey in this.specHideParts) {
      if (!this.specHideParts.hasOwnProperty(specHidePartsKey))
        continue;
      if (!avatar.hasOwnProperty(specHidePartsKey))
        continue;
      const partsNeedHide = this.specHideParts[specHidePartsKey];
      for (const onePart of partsNeedHide) {
        avatar[onePart] = { sn: "" };
      }
    }
    return avatar;
  }
  static toIAvatarSets(avatar) {
    if (!avatar)
      return [];
    const setsMap = new Map();
    for (const avatarKey in avatar) {
      if (!avatar.hasOwnProperty(avatarKey))
        continue;
      if (avatarKey === "id" || avatarKey === "dirable")
        continue;
      const val = avatar[avatarKey];
      if (val === void 0 || val === null)
        continue;
      let id = "";
      if (typeof val === "string") {
        id = val;
      } else {
        id = val.sn;
      }
      if (id.length === 0)
        continue;
      const slotName = this.toSlotName(avatarKey);
      if (!setsMap.has(id)) {
        setsMap.set(id, { id, parts: [] });
      }
      setsMap.get(id).parts.push(slotName);
      if (typeof val !== "string" && val.version !== void 0 && val.version !== null) {
        setsMap.get(id).version = val.version;
      }
    }
    return Array.from(setsMap.values());
  }
};
export let AvatarSuitType = _AvatarSuitType;
__publicField(AvatarSuitType, "avatarSuit");
__publicField(AvatarSuitType, "suitPart", {
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
});
__publicField(AvatarSuitType, "specHideParts", {
  headSpecId: ["headEyesId", "headHairId", "headMousId", "headHairBackId", "headHatsId", "headMaskId", "headFaceId", "headBaseId"],
  bodySpecId: ["bodyCostId", "bodyCostDresId", "bodyTailId", "bodyWingId", "bodyBaseId"],
  farmSpecId: ["farmCostId", "farmShldId", "farmWeapId", "farmBaseId"],
  barmSpecId: ["barmCostId", "barmShldId", "barmWeapId", "barmBaseId"],
  flegSpecId: ["flegCostId", "flegBaseId"],
  blegSpecId: ["blegCostId", "blegBaseId"]
});
__publicField(AvatarSuitType, "slotBitMap");
const _SuitAlternativeType = class {
  constructor() {
    __publicField(this, "costume", 1);
    __publicField(this, "hair", 2);
    __publicField(this, "eye", 4);
    __publicField(this, "mouse", 8);
    __publicField(this, "hat", 16);
    __publicField(this, "mask", 32);
    __publicField(this, "face", 64);
    __publicField(this, "weapon", 128);
    __publicField(this, "shield", 256);
    __publicField(this, "tail", 512);
    __publicField(this, "wing", 1024);
    __publicField(this, "helmet", 126);
    __publicField(this, "shell", 1537);
  }
  static checkAlternative(target, source) {
    this.suitAlternative = this.suitAlternative || new _SuitAlternativeType();
    const maskType = this.suitAlternative[target];
    const sourceType = this.suitAlternative[source];
    const value = maskType & sourceType;
    return value === maskType || value === sourceType;
  }
};
export let SuitAlternativeType = _SuitAlternativeType;
__publicField(SuitAlternativeType, "suitAlternative");
export class BaseAvatar {
  constructor() {
    __publicField(this, "id", "10000");
    __publicField(this, "barmBaseId", { sn: "0001" });
    __publicField(this, "blegBaseId", { sn: "0001" });
    __publicField(this, "bodyBaseId", { sn: "0001" });
    __publicField(this, "farmBaseId", { sn: "0001" });
    __publicField(this, "flegBaseId", { sn: "0001" });
    __publicField(this, "headBaseId", { sn: "0001" });
    __publicField(this, "headHairId", { sn: "5cd28238fb073710972a73c2" });
    __publicField(this, "headEyesId", { sn: "5cd28238fb073710972a73c2" });
    __publicField(this, "headMousId", { sn: "5cd28238fb073710972a73c2" });
    __publicField(this, "bodyCostId", { sn: "5cd28238fb073710972a73c2" });
  }
}
