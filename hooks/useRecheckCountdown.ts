import { useEffect, useRef, useState } from "react";

/**
 * Counts down from `totalMinutes` to zero and fires `onExpire` when done.
 * Returns remaining time as { minutes, seconds } and a `isExpired` flag.
 *
 * Designed to power the recheck countdown timer on Home State B.
 */
export function useRecheckCountdown(
	totalMinutes: number,
	onExpire?: () => void,
) {
	const totalSeconds = totalMinutes * 60;
	const [remaining, setRemaining] = useState(totalSeconds);
	const onExpireRef = useRef(onExpire);
	onExpireRef.current = onExpire;

	useEffect(() => {
		// Reset when totalMinutes changes (new case or new recheck interval)
		setRemaining(totalMinutes * 60);
	}, [totalMinutes]);

	useEffect(() => {
		const targetSeconds = totalMinutes * 60;
		if (targetSeconds <= 0) {
			return;
		}

		let active = true;
		const id = setInterval(() => {
			setRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(id);
					if (active) {
						active = false;
						onExpireRef.current?.();
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			active = false;
			clearInterval(id);
		};
	}, [totalMinutes]);

	const minutes = Math.floor(remaining / 60);
	const seconds = remaining % 60;

	return {
		minutes,
		seconds,
		isExpired: remaining <= 0,
		/** Formatted as "mm:ss" */
		formatted: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
	};
}
