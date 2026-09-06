package com.privatecall.india

import com.google.common.truth.Truth.assertThat
import com.privatecall.india.security.pin.PinSecurityManager
import org.junit.Test

class PinValidationTest {

    @Test
    fun testPinHashingAndVerification() {
        val pin = "1234"
        val salt = PinSecurityManager.generateSalt()
        val hash = PinSecurityManager.hashPin(pin, salt)

        // Correct PIN verifies
        assertThat(PinSecurityManager.verifyPin(pin, salt, hash)).isTrue()

        // Wrong PIN fails
        assertThat(PinSecurityManager.verifyPin("0000", salt, hash)).isFalse()
        assertThat(PinSecurityManager.verifyPin("1235", salt, hash)).isFalse()
    }
}
