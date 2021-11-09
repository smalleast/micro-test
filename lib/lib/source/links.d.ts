import type { AppInterface, sourceLinkInfo } from '@micro-app/types';
export declare const globalLinks: Map<string, string>;
/**
 * Extract link elements
 * @param link link element
 * @param parent parent element of link
 * @param app app
 * @param microAppHead micro-app-head element
 * @param isDynamic dynamic insert
 */
export declare function extractLinkFromHtml(link: HTMLLinkElement, parent: Node, app: AppInterface, microAppHead: Element | null, isDynamic?: boolean): any;
/**
 * Get link remote resources
 * @param wrapElement htmlDom
 * @param app app
 * @param microAppHead micro-app-head
 */
export declare function fetchLinksFromHtml(wrapElement: HTMLElement, app: AppInterface, microAppHead: Element): void;
/**
 * fetch link succeeded, replace placeholder with style tag
 * @param url resource address
 * @param info resource link info
 * @param data code
 * @param microAppHead micro-app-head
 * @param app app
 */
export declare function fetchLinkSuccess(url: string, info: sourceLinkInfo, data: string, microAppHead: Element, app: AppInterface): void;
/**
 * get css from dynamic link
 * @param url link address
 * @param info info
 * @param app app
 * @param originLink origin link element
 * @param replaceStyle style element which replaced origin link
 */
export declare function foramtDynamicLink(url: string, info: sourceLinkInfo, app: AppInterface, originLink: HTMLLinkElement, replaceStyle: HTMLStyleElement): void;
