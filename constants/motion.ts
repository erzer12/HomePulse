/**
 * HomePulse Motion System
 * Inspired by Emil Kowalski's Design Engineering Principles
 */

export const EASING = {
	// Strong ease-out for UI interactions (starts fast, feels responsive)
	out: "cubic-bezier(0.23, 1, 0.32, 1)",
	// Strong ease-in-out for on-screen movement
	inOut: "cubic-bezier(0.77, 0, 0.175, 1)",
	// iOS-like drawer curve
	drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
};

export const DURATION = {
	feedback: 160, // Button press, small toggles
	popover: 200, // Tooltips, small dropdowns
	screen: 300, // Main screen transitions
	stagger: 50, // Delay between list items
};

export const SPRING = {
	// Premium, weighty feel. No linear easing.
	standard: {
		stiffness: 100,
		damping: 20,
		mass: 1,
	},
	// Snappy for fast feedback
	snappy: {
		stiffness: 150,
		damping: 15,
		mass: 0.8,
	},
};

export const TACTILE = {
	activeScale: 0.97, // Subtle shrink on press
	enteringScale: 0.95, // Elements enter from 95% not 0%
};
