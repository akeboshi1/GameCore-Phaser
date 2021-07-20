export declare class Font {
    static readonly YAHEI_14_BOLD: string;
    static readonly YAHEI_16_BOLD: string;
    static readonly YAHEI_18_BOLD: string;
    static readonly YAHEI_20_BOLD: string;
    static readonly DEFULT_FONT = "'Source Han Sans', Helvetica, -apple-system, 'Noto Sans', 'Helvetica Neue', 'Nimbus Sans L', Arial, 'Liberation Sans', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Source Han Sans CN', 'Microsoft YaHei'";
    static readonly ZH_MAIN = "Source Han Sans";
    static readonly EN_MAINT = "tt0503m_";
    static readonly EN_BOLD = "tt0173m_";
    static readonly NUMBER = "t04B25";
    static readonly HELVETICA = "Helvetica";
    static isChineseChar(c: string): boolean;
    static isEnglishChar(c: string): boolean;
    static isNumberChar(c: string): boolean;
}
