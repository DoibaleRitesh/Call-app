package com.privatecall.india.security.pin

import java.security.MessageDigest
import java.security.SecureRandom

/**
 * Handles PIN hashing with cryptographic salt (SHA-256).
 * Protects against plaintext storage and rainbow table attacks.
 */
object PinSecurityManager {

    fun generateSalt(): String {
        val random = SecureRandom()
        val salt = ByteArray(16)
        random.nextBytes(salt)
        return salt.joinToString("") { "%02x".format(it) }
    }

    fun hashPin(pin: String, salt: String): String {
        val md = MessageDigest.getInstance("SHA-256")
        val combined = "$salt:$pin".toByteArray(Charsets.UTF_8)
        val digest = md.digest(combined)
        return digest.joinToString("") { "%02x".format(it) }
    }

    fun verifyPin(inputPin: String, salt: String, expectedHash: String): Boolean {
        val inputHash = hashPin(inputPin, salt)
        return inputHash.equals(expectedHash, ignoreCase = true)
    }
}
