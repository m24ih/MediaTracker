package com.media.tracker.util.converter;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AesEncryptorConverterTest {

    @Test
    void testValidKey() {
        String validKey = "12345678901234567890123456789012";
        AesEncryptorConverter converter = new AesEncryptorConverter(validKey);

        String originalText = "sensitive_data";
        String encrypted = converter.convertToDatabaseColumn(originalText);
        assertNotNull(encrypted);
        assertNotEquals(originalText, encrypted);

        String decrypted = converter.convertToEntityAttribute(encrypted);
        assertEquals(originalText, decrypted);
    }

    @Test
    void testInvalidKeyLength() {
        String invalidKey = "1234567890123456"; // 16 characters
        assertThrows(IllegalArgumentException.class, () -> {
            new AesEncryptorConverter(invalidKey);
        });
    }

    @Test
    void testNullKey() {
        assertThrows(IllegalArgumentException.class, () -> {
            new AesEncryptorConverter(null);
        });
    }
}
