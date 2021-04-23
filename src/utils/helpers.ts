export class Helpers {
    static openUrl(url: string) {
        const tempwindow = window.open("", "_blank"); // 先打开页面
        if (tempwindow) tempwindow.location.href = url; // 后更改页面地址
    }
}
