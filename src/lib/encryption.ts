import Cryptr from "cryptr";

let cryptr: Cryptr | null = null;

function getCryptr() {
	const secret = process.env.ENCRYPTION_KEY;

	if (!secret) {
		throw new Error("Missing ENCRYPTION_KEY environment variable");
	}

	if (!cryptr) {
		cryptr = new Cryptr(secret);
	}

	return cryptr;
}

export const encrypt = (text: string) => getCryptr().encrypt(text);
export const decrypt = (text: string) => getCryptr().decrypt(text);
