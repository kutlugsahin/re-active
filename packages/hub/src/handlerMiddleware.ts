import { Handler, HandlerDefinition, HandlerMap, Middleware, Store } from './types';

export const handlerMiddleware: (handlerMap: HandlerMap) => Middleware = (handlerMap: HandlerMap) => {
    const handlerActionMap = new Map<string, Set<Handler>>();

    handlerMap.forEach(([handler, type]: HandlerDefinition) => {
        const actionTypes = typeof type === 'string' ? [type] : type;

        actionTypes.forEach((type) => {
            if (!handlerActionMap.has(type)) {
                handlerActionMap.set(type, new Set<Handler>())
            }

            handlerActionMap.get(type)?.add(handler);
        });
    });

    return (store: Store) => (next: (action: any) => void) => (action: any) => {
        if (action && action.type) {
            const handlerSet = handlerActionMap.get(action.type);

            if (handlerSet) {
                for (const handler of handlerSet) {
                    handler(store.getState(), action);
                }
            }
        }

        next(action);
    }
}