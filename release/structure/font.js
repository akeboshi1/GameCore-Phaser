var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class Font {
  static isChineseChar(c) {
    const pattern = new RegExp("[\u4E00-\u9FA5]+");
    if (pattern.test(c)) {
      return true;
    }
    return false;
  }
  static isEnglishChar(c) {
    const pattern = new RegExp("[A-Za-z]+");
    if (pattern.test(c)) {
      return true;
    }
    return false;
  }
  static isNumberChar(c) {
    const pattern = new RegExp("[0-9]+");
    if (pattern.test(c)) {
      return true;
    }
    return false;
  }
}
__publicField(Font, "YAHEI_14_BOLD", "bold 14px YaHei");
__publicField(Font, "YAHEI_16_BOLD", "bold 16px YaHei");
__publicField(Font, "YAHEI_18_BOLD", "bold 18px YaHei");
__publicField(Font, "YAHEI_20_BOLD", "bold 20px YaHei");
__publicField(Font, "DEFULT_FONT", "'Source Han Sans', Helvetica, -apple-system, 'Noto Sans', 'Helvetica Neue', 'Nimbus Sans L', Arial, 'Liberation Sans', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Source Han Sans CN', 'Microsoft YaHei'");
__publicField(Font, "ZH_MAIN", "Source Han Sans");
__publicField(Font, "EN_MAINT", "tt0503m_");
__publicField(Font, "EN_BOLD", "tt0173m_");
__publicField(Font, "NUMBER", "t04B25");
__publicField(Font, "HELVETICA", "Helvetica");
