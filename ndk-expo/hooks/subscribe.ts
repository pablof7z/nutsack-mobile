import {
    NDKEvent,
    NDKEventId,
    NDKFilter,
    NDKRelaySet,
    NDKSubscription,
    NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
    import { useCallback, useEffect, useMemo, useRef } from 'react';
    import { create } from 'zustand';
    import { useNDK } from './ndk';
type State = {
    subscription: NDKSubscription | undefined;
    eose: boolean;
    events: NDKEvent[];
    knownEventIds: Set<NDKEventId>;
};
  
type UseSubscribeParams = {
    filters: NDKFilter | NDKFilter[];
    opts?: NDKSubscriptionOptions | undefined;
    relays?: string[] | undefined;
    klass?: NDKEventWithFrom<any>;
};

export type NDKEventWithFrom<T extends NDKEvent> = {
    from: (event: NDKEvent) => T | undefined;
}
  
  /**
   * Hook for subscribing to events. Remember to use memoized params to avoid infinite re-render loops.
   *
   * @param filters - An array of NDKFilter objects.
   * @param opts - Optional NDKSubscriptionOptions for configuring the subscription.
   * @param relays - Optional array of relay URLs to use for this subscription.
   * @returns An object containing the sorted events, subscription status, end of stream flag, and an unSubscribe function.
   */
  export const useSubscribe = ({
        filters,
        opts = undefined,
        relays = undefined,
        klass = undefined
}: UseSubscribeParams) => {
    // Initial state
    const initialState = useRef({
        subscription: undefined,
        eose: false,
        events: [],
        knownEventIds: new Set<NDKEventId>(),
    });

    // Create a store ref for each instance of the hook
    const useStoreRef = useRef(
        create<State>()(() => ({
            ...initialState.current,
        }))
    );

    // Get reactive NDK instance from the global store
    const { ndk } = useNDK();
    const relaySet = useMemo(() => ndk && relays && relays.length > 0 ? NDKRelaySet.fromRelayUrls(relays, ndk) : undefined, [relays, ndk]);

    // Use the custom NDK instance if provided

    // Get reactive states from the store
    const subscription = useStoreRef.current((state) => state.subscription);
    const eose = useStoreRef.current((state) => state.eose);
    const events = useStoreRef.current((state) => state.events);

    // Sort the events by created_at timestamp
    const sortedEvents: NDKEvent[] = useMemo(
        () => (events ? events.sort((a, b) => b.created_at! - a.created_at!) : []),
        [events]
    );

    // const handleEvent = useCallback((event: NDKEvent) => {
    //     if (useStoreRef.current.getState().knownEventIds.has(event.id)) return;
    //     useStoreRef.current.getState().knownEventIds.add(event.id);

    //     if (klass) event = klass.from(event);
        
    //     useStoreRef.current.setState((state) => {
    //         state.events.push(event);
    //         return { events: state.events };
    //     });
    // }, [ndk]);

    const handleEose = useCallback(() => {
        useStoreRef.current.setState({ eose: true });
    }, [opts]);

    const handleClosed = useCallback(() => {
        useStoreRef.current.setState({ subscription: undefined });
    }, [filters]);

    useEffect(() => { console.log('filters changed', filters) }, [filters])
    useEffect(() => { console.log('ndk changed', ndk) }, [ndk])
    useEffect(() => { console.log('opts changed', opts) }, [opts])
    useEffect(() => { console.log('relays changed', relays) }, [relays])

    useEffect(() => {
        if (useStoreRef.current.getState().subscription) {
            console.log('subscription already exists')
            return;
        }

        // Stop the subscription if it is already running
        useStoreRef.current.getState().subscription?.stop();

        // Reset the state
        // useStoreRef.current.setState({ ...initialState.current, subscription: undefined });

        if (filters.length > 0 && !!ndk) {
            if (useStoreRef.current.getState().subscription) {
                console.log('subscription already exists', useStoreRef.current.getState().subscription)
                return;
            }
            console.log('creating new subscription')

            const newSubscription = ndk.subscribe(filters, opts, relaySet, false);

            // Listen for events and update the state
            newSubscription.on('event', (event: NDKEvent) => {
                useStoreRef.current.setState((state) => {
                    return { events: [...state.events, event] };
                });
            });
            // newSubscription.on('eose', handleEose);
            // newSubscription.on('closed', handleClosed);

            // Update the state with the new subscription
            useStoreRef.current.setState({ subscription: newSubscription });

            newSubscription.start();
        }

        return () => {
            console.log('unsubscribing')
            // Stop the subscription when the component unmounts
            useStoreRef.current.getState().subscription?.stop();

            // Reset the state
            useStoreRef.current.setState({ ...initialState.current, subscription: undefined });
        };
    }, [ndk, filters, klass, relays, opts]);

    return { events: sortedEvents, eose, isSubscribed: !!subscription };
};