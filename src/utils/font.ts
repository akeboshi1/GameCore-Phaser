import { i18n } from "./i18n";

export class Font {
    static readonly YAHEI_14_BOLD: string = "bold 14px YaHei";
    static readonly YAHEI_16_BOLD: string = "bold 16px YaHei";
    static readonly YAHEI_18_BOLD: string = "bold 18px YaHei";
    static readonly YAHEI_20_BOLD: string = "bold 20px YaHei";

    // static readonly DEFULT_FONT = "-apple-system, 'Noto Sans', 'Helvetica Neue', Helvetica, 'Nimbus Sans L', Arial, 'Liberation Sans', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Source Han Sans CN', 'Microsoft YaHei'";
    static readonly ZH_MAIN = "Source Han Sans";
    static readonly EN_MAINT = "tt0503m_";
    static readonly EN_BOLD = "tt0173m_";
    static readonly NUMBER = "t04B25";
    static get DEFULT_FONT() {
        if (i18n.language === "en") {
            return this.EN_MAINT;
        } else {
            return this.ZH_MAIN;
        }
    }
    static get BOLD_FONT() {
        if (i18n.language === "en") {
            return this.EN_BOLD;
        } else {
            return this.ZH_MAIN;
        }
    }
}
