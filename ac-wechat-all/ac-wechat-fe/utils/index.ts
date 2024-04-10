
export function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}


export function formatDateTime(dateTimeStr: any): string {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function obscureString(str: string) {
    if (!str) {
        return '';
    }
    return str.replace(/./g, '*');
}



export function getWebSocketUrl(beServiceDomain: string, relativePath: string) {
    // 获取当前页面的URL
    const currentUrl = window.location;
    // 根据当前页面的协议确定WebSocket的协议
    const wsProtocol = currentUrl.protocol === "https:" ? "wss:" : "ws:";
    // 构建WebSocket的URL
    // const wsUrl = `${wsProtocol}//${currentUrl.host}${relativePath}`;
    const wsUrl = `${wsProtocol}//${beServiceDomain}${relativePath}`;
    return wsUrl;
}