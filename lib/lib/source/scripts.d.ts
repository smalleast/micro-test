import type { AppInterface, sourceScriptInfo, Func } from '@micro-app/types';
declare type moduleCallBack = Func & {
    moduleCount?: number;
};
export declare const globalScripts: Map<string, string>;
/**
 * Extract script elements
 * @param script script element
 * @param parent parent element of script
 * @param app app
 * @param isDynamic dynamic insert
 */
export declare function extractScriptElement(script: HTMLScriptElement, parent: Node, app: AppInterface, isDynamic?: boolean): any;
/**
 *  Get remote resources of script
 * @param wrapElement htmlDom
 * @param app app
 */
export declare function fetchScriptsFromHtml(wrapElement: HTMLElement, app: AppInterface): void;
/**
 * fetch js succeeded, record the code value
 * @param url script address
 * @param info resource script info
 * @param data code
 */
export declare function fetchScriptSuccess(url: string, info: sourceScriptInfo, data: string): void;
/**
 * Execute js in the mount lifecycle
 * @param scriptList script list
 * @param app app
 * @param initedHook callback for umd mode
 */
export declare function execScripts(scriptList: Map<string, sourceScriptInfo>, app: AppInterface, initedHook: moduleCallBack): void;
/**
 * run code
 * @param url script address
 * @param code js code
 * @param app app
 * @param module type='module' of script
 * @param isDynamic dynamically created script
 * @param callback callback of module script
 */
export declare function runScript(url: string, code: string, app: AppInterface, module: boolean, isDynamic: boolean, callback?: moduleCallBack): any;
/**
 * Get dynamically created remote script
 * @param url script address
 * @param info info
 * @param app app
 * @param originScript origin script element
 */
export declare function runDynamicRemoteScript(url: string, info: sourceScriptInfo, app: AppInterface, originScript: HTMLScriptElement): HTMLScriptElement | Comment;
export {};
