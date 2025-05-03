class PasswordCrypto {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    async deriveKey(password, salt) {
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            this.encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async encrypt(plaintext, password) {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await this.deriveKey(password, salt);

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            this.encoder.encode(plaintext)
        );

        const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        result.set(salt, 0);
        result.set(iv, salt.length);
        result.set(new Uint8Array(encrypted), salt.length + iv.length);

        return btoa(String.fromCharCode(...result));
    }

    async decrypt(encryptedData, password) {
        try {
            const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));

            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const encrypted = data.slice(28);

            const key = await this.deriveKey(password, salt);

            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encrypted
            );

            return this.decoder.decode(decrypted);
        } catch (error) {
            throw new Error('Decryption failed');
        }
    }

    async hashPassword(password) {
        const encoded = this.encoder.encode(password);
        const hash = await window.crypto.subtle.digest('SHA-256', encoded);
        return btoa(String.fromCharCode(...new Uint8Array(hash)));
    }
}

window.PasswordCrypto = PasswordCrypto;