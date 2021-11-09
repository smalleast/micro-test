declare type RequestIdleCallbackOptions = {
    timeout: number;
};
declare type RequestIdleCallbackInfo = {
    readonly didTimeout: boolean;
    timeRemaining: () => number;
};
declare global {
    interface Window {
        requestIdleCallback(callback: (info: RequestIdleCallbackInfo) => void, opts?: RequestIdleCallbackOptions): number;
        _babelPolyfill: boolean;
        proxyWindow?: WindowProxy;
        __MICRO_APP_ENVIRONMENT__?: boolean;
        __MICRO_APP_UMD_MODE__?: boolean;
        __MICRO_APP_BASE_APPLICATION__?: boolean;
    }
    interface Element {
        __MICRO_APP_NAME__?: string;
        data?: any;
    }
    interface Node {
        __MICRO_APP_NAME__?: string;
    }
    interface HTMLStyleElement {
        linkpath?: string;
    }
}
declare const globalEnv: Record<string, any>;
export declare function initGloalEnv(): void;
export default globalEnv;
