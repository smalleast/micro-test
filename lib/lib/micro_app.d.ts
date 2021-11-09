import type { OptionsType, MicroAppConfigType, lifeCyclesType, plugins, fetchType } from '@micro-app/types';
import preFetch from './prefetch';
import { EventCenterForBaseApp } from './interact';
declare class MicroApp extends EventCenterForBaseApp implements MicroAppConfigType {
    tagName: string;
    shadowDOM?: boolean;
    destory?: boolean;
    inline?: boolean;
    disableScopecss?: boolean;
    disableSandbox?: boolean;
    macro?: boolean;
    lifeCycles?: lifeCyclesType;
    plugins?: plugins;
    fetch?: fetchType;
    preFetch: typeof preFetch;
    start(options?: OptionsType): void;
}
declare const _default: MicroApp;
export default _default;
