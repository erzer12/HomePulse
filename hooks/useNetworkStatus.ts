import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export type NetworkStatus = {
	isConnected: boolean;
	isInternetReachable: boolean | null;
};

/**
 * Reactive hook for current network connectivity.
 * Extracted from store/sync.ts inline logic so screens can read this
 * directly without coupling to the Zustand store.
 */
export function useNetworkStatus(): NetworkStatus {
	const [status, setStatus] = useState<NetworkStatus>({
		isConnected: true,
		isInternetReachable: null,
	});

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			setStatus({
				isConnected: state.isConnected ?? true,
				isInternetReachable: state.isInternetReachable,
			});
		});

		// Fetch immediately on mount
		NetInfo.fetch().then((state) => {
			setStatus({
				isConnected: state.isConnected ?? true,
				isInternetReachable: state.isInternetReachable,
			});
		});

		return unsubscribe;
	}, []);

	return status;
}
