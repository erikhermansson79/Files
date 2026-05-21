import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

export function useKeyEvent(callback, node = null) {
    const callbackRef = useRef(callback);
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    // handle what happens on key press
    const handleKeyPress = useCallback(
        (event) => {
            callbackRef.current(event);
        },
        []
    );

    useEffect(() => {
        const targetNode = node ?? document;

        // attach the event listener
        targetNode &&
            targetNode.addEventListener('keydown', handleKeyPress);

        // remove the event listener
        return () => {
            targetNode &&
                targetNode.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress, node]);

}
