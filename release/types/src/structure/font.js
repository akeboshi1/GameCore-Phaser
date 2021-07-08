var Font = /** @class */ (function () {
    function Font() {
    }
    Font.isChineseChar = function (c) {
        var pattern = new RegExp("[\u4E00-\u9FA5]+");
        if (pattern.test(c)) {
            return true;
        }
        return false;
    };
    Font.isEnglishChar = function (c) {
        var pattern = new RegExp("[A-Za-z]+");
        if (pattern.test(c)) {
            return true;
        }
        return false;
    };
    Font.isNumberChar = function (c) {
        var pattern = new RegExp("[0-9]+");
        if (pattern.test(c)) {
            return true;
        }
        return false;
    };
    Font.YAHEI_14_BOLD = "bold 14px YaHei";
    Font.YAHEI_16_BOLD = "bold 16px YaHei";
    Font.YAHEI_18_BOLD = "bold 18px YaHei";
    Font.YAHEI_20_BOLD = "bold 20px YaHei";
    Font.DEFULT_FONT = "'Source Han Sans', Helvetica, -apple-system, 'Noto Sans', 'Helvetica Neue', 'Nimbus Sans L', Arial, 'Liberation Sans', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Source Han Sans CN', 'Microsoft YaHei'";
    Font.ZH_MAIN = "Source Han Sans";
    Font.EN_MAINT = "tt0503m_";
    Font.EN_BOLD = "tt0173m_";
    Font.NUMBER = "t04B25";
    Font.HELVETICA = "Helvetica";
    return Font;
}());
export { Font };
//# sourceMappingURL=font.js.map