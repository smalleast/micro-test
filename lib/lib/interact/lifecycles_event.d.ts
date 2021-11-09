/**
 * dispatch lifeCycles event
 * @param element container
 * @param appName app.name
 * @param lifecycleName lifeCycle name
 * @param error param from error hook
 */
export default function dispatchLifecyclesEvent(element: HTMLElement, appName: string, lifecycleName: string, error?: Error): void;
/**
 * Dispatch unmount event to micro app
 * @param appName app.name
 */
export declare function dispatchUnmountToMicroApp(appName: string): void;
