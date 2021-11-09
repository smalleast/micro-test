import type { prefetchParamList, globalAssetsType } from '@micro-app/types';
/**
 * preFetch([
 *  {
 *    name: string,
 *    url: string,
 *    disableScopecss?: boolean,
 *    disableSandbox?: boolean,
 *    macro?: boolean,
 *  },
 *  ...
 * ])
 * Note:
 *  1: preFetch is asynchronous and is performed only when the browser is idle
 *  2: disableScopecss, disableSandbox, macro must be same with micro-app element, if conflict, the one who executes first shall prevail
 * @param apps micro apps
 */
export default function preFetch(apps: prefetchParamList): void;
/**
 * load global assets into cache
 * @param assets global assets of js, css
 */
export declare function getGlobalAssets(assets: globalAssetsType): void;
