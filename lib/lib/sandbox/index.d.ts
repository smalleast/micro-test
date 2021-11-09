import type { SandBoxInterface, microWindowType } from '@micro-app/types';
import { EventCenterForMicroApp } from '../interact';
declare type injectDataType = {
    __MICRO_APP_ENVIRONMENT__: boolean;
    __MICRO_APP_NAME__: string;
    __MICRO_APP_PUBLIC_PATH__: string;
    __MICRO_APP_BASE_URL__: string;
    __MICRO_APP_BASE_ROUTE__: string;
    __MICRO_APP_UMDMODE__: boolean;
    microApp: EventCenterForMicroApp;
    rawWindow: Window;
    rawDocument: Document;
    removeDomScope: () => void;
};
export default class SandBox implements SandBoxInterface {
    static activeCount: number;
    active: boolean;
    proxyWindow: WindowProxy & injectDataType;
    recordUmdEffect: CallableFunction;
    rebuildUmdEffect: CallableFunction;
    releaseEffect: CallableFunction;
    scopeProperties: PropertyKey[];
    escapeProperties: PropertyKey[];
    microWindow: Window & injectDataType;
    injectedKeys: Set<string | number | symbol>;
    escapeKeys: Set<string | number | symbol>;
    recordUmdinjectedValues?: Map<PropertyKey, unknown>;
    constructor(appName: string, url: string, macro: boolean);
    start(baseroute: string): void;
    stop(): void;
    recordUmdSnapshot(): void;
    rebuildUmdSnapshot(): void;
    /**
     * get scopeProperties and escapeProperties from plugins
     * @param appName app name
     */
    getScopeProperties(appName: string): void;
    /**
     * inject global properties to microWindow
     * @param microWindow micro window
     * @param appName app name
     * @param url app url
     */
    inject(microWindow: microWindowType, appName: string, url: string): void;
}
export {};
