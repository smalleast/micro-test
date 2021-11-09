import type { microWindowType } from '@micro-app/types';
export declare function effectDocumentEvent(): void;
export declare function releaseEffectDocumentEvent(): void;
/**
 * Rewrite side-effect events
 * @param microWindow micro window
 */
export default function effect(microWindow: microWindowType): Record<string, CallableFunction>;
