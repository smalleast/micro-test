import type { AppInterface, sourceType, SandBoxInterface } from '@micro-app/types';
export declare const appInstanceMap: Map<string, AppInterface>;
export interface CreateAppParam {
    name: string;
    url: string;
    scopecss: boolean;
    useSandbox: boolean;
    macro?: boolean;
    inline?: boolean;
    baseroute?: string;
    container?: HTMLElement | ShadowRoot;
}
export default class CreateApp implements AppInterface {
    private status;
    private loadSourceLevel;
    private umdHookMount;
    private umdHookunMount;
    private libraryName;
    private umdMode;
    isPrefetch: boolean;
    name: string;
    url: string;
    container: HTMLElement | ShadowRoot | null;
    inline: boolean;
    scopecss: boolean;
    useSandbox: boolean;
    macro: boolean;
    baseroute: string;
    source: sourceType;
    sandBox: SandBoxInterface | null;
    constructor({ name, url, container, inline, scopecss, useSandbox, macro, baseroute }: CreateAppParam);
    loadSourceCode(): void;
    /**
     * When resource is loaded, mount app if it is not prefetch or unmount
     */
    onLoad(html: HTMLElement): void;
    /**
     * Error loading HTML
     * @param e Error
     */
    onLoadError(e: Error): void;
    /**
     * mount app
     * @param container app container
     * @param inline js runs in inline mode
     * @param baseroute route prefix, default is ''
     */
    mount(container?: HTMLElement | ShadowRoot, inline?: boolean, baseroute?: string): void;
    /**
     * dispatch mounted event when app run finished
     */
    dispatchMountedEvent(): void;
    /**
     * unmount app
     * @param destory completely destroy, delete cache resources
     */
    unmount(destory: boolean): void;
    /**
     * app rendering error
     * @param e Error
     */
    onerror(e: Error): void;
    getAppStatus(): string;
    private getUmdLibraryHooks;
}
