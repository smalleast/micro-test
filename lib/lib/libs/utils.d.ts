import type { Func } from '@micro-app/types';
export declare const version = "__VERSION__";
export declare const isBrowser: boolean;
export declare const globalThis: any;
export declare function isUndefined(target: unknown): target is undefined;
export declare function isNull(target: unknown): target is null;
export declare function isString(target: unknown): target is string;
export declare function isBoolean(target: unknown): target is boolean;
export declare function isFunction(target: unknown): boolean;
export declare const isArray: (arg: any) => arg is any[];
export declare function isPlainObject(target: unknown): boolean;
export declare function isPromise(target: unknown): boolean;
/**
 * format error log
 * @param msg message
 * @param appName app name, default is null
 */
export declare function logError(msg: unknown, appName?: string | null, ...rest: any[]): void;
/**
 * format warn log
 * @param msg message
 * @param appName app name, default is null
 */
export declare function logWarn(msg: unknown, appName?: string | null, ...rest: any[]): void;
/**
 * async execution
 * @param fn callback
 * @param args params
 */
export declare function defer(fn: Func, ...args: any[]): void;
/**
 * Add address protocol
 * @param url address
 */
export declare function addProtocol(url: string): string;
/**
 * Format URL address
 * @param url address
 */
export declare function formatURL(url: string | null, appName?: string | null): string;
/**
 * Get valid address, such as https://xxx/xx/xx.html to https://xxx/xx/
 * @param url app.url
 */
export declare function getEffectivePath(url: string): string;
/**
 * Complete address
 * @param path address
 * @param baseURI base url(app.url)
 */
export declare function CompletionPath(path: string, baseURI: string): string;
/**
 * Get the folder where the link resource is located,
 * which is used to complete the relative address in the css
 * @param linkpath full link address
 */
export declare function getLinkFileDir(linkpath: string): string;
/**
 * promise stream
 * @param promiseList promise list
 * @param successCb success callback
 * @param errorCb failed callback
 * @param finallyCb finally callback
 */
export declare function promiseStream<T>(promiseList: Array<Promise<T> | T>, successCb: CallableFunction, errorCb: CallableFunction, finallyCb?: CallableFunction): void;
export declare function isSupportModuleScript(): boolean;
export declare function createNonceSrc(): string;
export declare function unique(array: any[]): any[];
export declare const requestIdleCallback: any;
export declare function setCurrentAppName(appName: string | null): void;
export declare function getCurrentAppName(): string | null;
export declare function removeDomScope(): void;
export declare function isSafari(): boolean;
/**
 * Create pure elements
 */
export declare function pureCreateElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
/**
 * clone origin elements to target
 * @param origin Cloned element
 * @param target Accept cloned elements
 * @param deep deep clone or transfer dom
 */
export declare function cloneNode<T extends Element, Q extends Element>(origin: T, target: Q, deep: boolean): void;
