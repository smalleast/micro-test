import { CallableFunctionForInteract } from '@micro-app/types';
declare class EventCenterForGlobal {
    /**
     * add listener of global data
     * @param cb listener
     * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
     */
    addGlobalDataListener(cb: CallableFunctionForInteract, autoTrigger?: boolean): void;
    /**
     * remove listener of global data
     * @param cb listener
     */
    removeGlobalDataListener(cb: CallableFunctionForInteract): void;
    /**
     * dispatch global data
     * @param data data
     */
    setGlobalData(data: Record<PropertyKey, unknown>): void;
    /**
     * clear all listener of global data
     * if appName exists, only the specified functions is cleared
     * if appName not exists, only clear the base app functions
     */
    clearGlobalDataListener(): void;
}
export declare class EventCenterForBaseApp extends EventCenterForGlobal {
    /**
     * add listener
     * @param appName app.name
     * @param cb listener
     * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
     */
    addDataListener(appName: string, cb: CallableFunction, autoTrigger?: boolean): void;
    /**
     * remove listener
     * @param appName app.name
     * @param cb listener
     */
    removeDataListener(appName: string, cb: CallableFunction): void;
    /**
     * get data from micro app or base app
     * @param appName app.name
     * @param fromBaseApp whether get data from base app, default is false
     */
    getData(appName: string, fromBaseApp?: boolean): Record<PropertyKey, unknown> | null;
    /**
     * Dispatch data to the specified micro app
     * @param appName app.name
     * @param data data
     */
    setData(appName: string, data: Record<PropertyKey, unknown>): void;
    /**
     * clear all listener for specified micro app
     * @param appName app.name
     */
    clearDataListener(appName: string): void;
}
export declare class EventCenterForMicroApp extends EventCenterForGlobal {
    appName: string;
    umdDataListeners?: {
        global: Set<CallableFunctionForInteract>;
        normal: Set<CallableFunctionForInteract>;
    };
    constructor(appName: string);
    /**
     * add listener, monitor the data sent by the base app
     * @param cb listener
     * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
     */
    addDataListener(cb: CallableFunctionForInteract, autoTrigger?: boolean): void;
    /**
     * remove listener
     * @param cb listener
     */
    removeDataListener(cb: CallableFunctionForInteract): void;
    /**
     * get data from base app
     */
    getData(): Record<PropertyKey, unknown> | null;
    /**
     * dispatch data to base app
     * @param data data
     */
    dispatch(data: Record<PropertyKey, unknown>): void;
    /**
     * clear all listeners
     */
    clearDataListener(): void;
}
/**
 * Record UMD function before exec umdHookMount
 * @param microAppEventCneter
 */
export declare function recordDataCenterSnapshot(microAppEventCneter: EventCenterForMicroApp): void;
/**
 * Rebind the UMD function of the record before remount
 * @param microAppEventCneter instance of EventCenterForMicroApp
 */
export declare function rebuildDataCenterSnapshot(microAppEventCneter: EventCenterForMicroApp): void;
export {};
