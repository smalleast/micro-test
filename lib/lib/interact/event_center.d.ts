import { CallableFunctionForInteract } from '@micro-app/types';
export default class EventCenter {
    eventList: Map<string, {
        data: Record<PropertyKey, unknown>;
        callbacks: Set<CallableFunctionForInteract>;
    }>;
    isLegalName(name: string): boolean;
    /**
     * add listener
     * @param name event name
     * @param f listener
     * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
     */
    on(name: string, f: CallableFunctionForInteract, autoTrigger?: boolean): void;
    off(name: string, f?: CallableFunctionForInteract): void;
    dispatch(name: string, data: Record<PropertyKey, unknown>): void;
    getData(name: string): Record<PropertyKey, unknown> | null;
}
