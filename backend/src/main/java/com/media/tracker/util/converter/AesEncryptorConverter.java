package com.media.tracker.util.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Converter
public class AesEncryptorConverter
        implements AttributeConverter<String, String> {

    /** Algorithm used for encryption. */
    private static final String ALGORITHM = "AES/ECB/PKCS5Padding";

    /** Required length for the AES key. */
    private static final int KEY_LENGTH = 32;

    /** The encryption key. */
    private final byte[] key;

    /**
     * Constructs a new AesEncryptorConverter.
     * Loads the key from the AES_SECRET_KEY environment variable.
     */
    public AesEncryptorConverter() {
        String envKey = System.getenv("AES_SECRET_KEY");
        if (envKey == null || envKey.trim().isEmpty()) {
            throw new IllegalStateException(
                "AES_SECRET_KEY environment variable is not set or empty. "
                + "A 32-character (256-bit) key is strictly required.");
        }
        if (envKey.length() != KEY_LENGTH) {
            throw new IllegalStateException(
                "AES_SECRET_KEY must be exactly 32 characters long.");
        }
        this.key = envKey.getBytes();
    }

    /**
     * Constructs a new AesEncryptorConverter with a given key (for testing).
     *
     * @param testKey The key to use.
     */
    AesEncryptorConverter(final String testKey) {
        if (testKey == null || testKey.length() != KEY_LENGTH) {
            throw new IllegalArgumentException(
                "Test key must be exactly 32 characters.");
        }
        this.key = testKey.getBytes();
    }

    @Override
    public final String convertToDatabaseColumn(final String attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE,
                    new SecretKeySpec(this.key, "AES"));
            return Base64.getEncoder()
                    .encodeToString(cipher.doFinal(attribute.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting data", e);
        }
    }

    @Override
    public final String convertToEntityAttribute(final String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(this.key, "AES"));
            return new String(cipher.doFinal(
                    Base64.getDecoder().decode(dbData)));
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting data", e);
        }
    }
}
