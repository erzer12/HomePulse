import * as Crypto from "expo-crypto";

export function createUuid() {
	return Crypto.randomUUID();
}

export function createCompactId() {
	return createUuid().replace(/-/g, "");
}
