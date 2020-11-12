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

    static fontSzie(size: number, text: string,) {
        let width: number = 0;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            width += this.charSize(size, char);
        }
        return width;
    }
    static charSize(size: number, char: string) {
        let width: number = 0;
        const sizeradio = 25 / 26;
        const c = 0.92, le = 0.55, ue = 0.714, n = 0.55;
        if (this.isChineseChar(char)) {
            width = sizeradio * size * c;
        } else if (this.isEnglishChar(char)) {
            if (/^[A-Z]+$/.test(char)) {
                width = sizeradio * size * ue;
            } else {
                width = sizeradio * size * le;
            }
        } else {
            width = sizeradio * size * n;
        }
        return width;
    }
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
}
