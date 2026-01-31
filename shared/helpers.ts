export async function generateKeyPair() {
    return crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function exportKey(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey(
        key.type === "public" ? "spki" : "pkcs8",
        key
    );
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function deriveKey(password: string, salt: Uint8Array) {
    const enc = new TextEncoder();

    const baseKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100_000,
            hash: "SHA-256",
        },
        baseKey,
        {name: "AES-GCM", length: 256},
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptPrivateKey(
    privateKeyString: string,
    password: string
) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const key = await deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        base64ToArrayBuffer(privateKeyString)
    );

    return {
        encryptedPrivateKey: btoa(
            String.fromCharCode(...new Uint8Array(encrypted))
        ),
        iv: Array.from(iv),
        salt: Array.from(salt),
    };
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
    return btoa(
        String.fromCharCode(...new Uint8Array(buffer))
    )
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export function stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str)
}

export function uint8ArrayToString(arr: Uint8Array): string {
    return new TextDecoder("utf-8").decode(arr)
}

export async function decryptPrivateKeyString(
    encryptedBase64: string,
    password: string,
    iv: number[],
    salt: number[]
) {
    const key = await deriveKey(password, new Uint8Array(salt))

    // decrypt
    return await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        base64ToArrayBuffer(encryptedBase64)
    );
}

export async function encryptUsingPublicKey(
    publicKey: CryptoKey,
    data: BufferSource,
): Promise<ArrayBuffer> {
    return await crypto.subtle.encrypt(
        {name: 'RSA-OAEP'},
        publicKey,
        data,
    )
}

export async function decryptUsingPrivateKey(
    privateKey: CryptoKey,
    data: BufferSource,
): Promise<ArrayBuffer> {
    return await crypto.subtle.decrypt(
        {name: 'RSA-OAEP'},
        privateKey,
        data,
    )
}

async function importAesKey(rawKey: Uint8Array) {
    return crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    )
}

export async function encryptUsingCustomKey(
    rawKey: Uint8Array,
    data: BufferSource,
) {
    const key = await importAesKey(rawKey)

    const iv = crypto.getRandomValues(new Uint8Array(12)) // 96-bit recommended

    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        data
    )

    return {
        iv: Array.from(iv),
        ciphertext: encrypted,
    }
}

export async function decryptUsingCustomKey(
    rawKey: Uint8Array,
    ciphertext: BufferSource,
    iv: number[],
) {
    const key = await importAesKey(rawKey)

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new Uint8Array(iv),
        },
        key,
        ciphertext
    )

    return new Uint8Array(decrypted)
}

export async function importPrivateKey(privateKeyBuffer: ArrayBuffer) {
    return crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: { name: "SHA-256" },
        },
        false,
        ["decrypt"]
    );
}

export async function importPublicKey(publicKeyBase64: string) {
    return crypto.subtle.importKey(
        "spki",
        base64ToArrayBuffer(publicKeyBase64),
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

