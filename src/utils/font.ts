import { i18n } from "./i18n";

export class Font {
    static readonly YAHEI_14_BOLD: string = "bold 14px YaHei";
    static readonly YAHEI_16_BOLD: string = "bold 16px YaHei";
    static readonly YAHEI_18_BOLD: string = "bold 18px YaHei";
    static readonly YAHEI_20_BOLD: string = "bold 20px YaHei";

    static readonly DEFULT_FONT = "Helvetica, 'Source Han Sans', -apple-system, 'Noto Sans', 'Helvetica Neue', 'Nimbus Sans L', Arial, 'Liberation Sans', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Source Han Sans CN', 'Microsoft YaHei'";
    static readonly ZH_MAIN = "Source Han Sans";
    static readonly EN_MAINT = "tt0503m_";
    static readonly EN_BOLD = "tt0173m_";
    static readonly NUMBER = "t04B25";
    static readonly HELVETICA = "Helvetica";
    static isChineseChar(c: string) {
        const pattern = new RegExp("[\u4E00-\u9FA5]+");
        if (pattern.test(c)) {
            return true;
        }
        return false;
    }

    static isEnglishChar(c: string) {
        const pattern = new RegExp("[A-Za-z]+");
        if (pattern.test(c)) {
            return true;
        }
        return false;
    }

    static isNumberChar(c: string) {
        const pattern = new RegExp("[0-9]+");
        if (pattern.test(c)) {
            return true;
        }
        return false;
    }
}
