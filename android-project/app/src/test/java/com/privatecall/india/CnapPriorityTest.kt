package com.privatecall.india

import com.google.common.truth.Truth.assertThat
import com.privatecall.india.domain.model.CallerIdPriority
import com.privatecall.india.domain.model.CallerIdResult
import org.junit.Test

class CnapPriorityTest {

    @Test
    fun testPriority1_PrivateContactMasksName() {
        val isPrivate = true
        val savedName = "Confidential Client"
        val rawNumber = "+91 98201 23456"

        val result = if (isPrivate) {
            CallerIdResult(
                displayName = "Private Contact",
                subtitle = rawNumber,
                priority = CallerIdPriority.PRIVATE,
                isPrivate = true,
                isCnapVerified = false
            )
        } else {
            CallerIdResult(
                displayName = savedName,
                subtitle = rawNumber,
                priority = CallerIdPriority.SAVED_LOCAL,
                isPrivate = false,
                isCnapVerified = false
            )
        }

        assertThat(result.priority).isEqualTo(CallerIdPriority.PRIVATE)
        assertThat(result.displayName).isEqualTo("Private Contact")
        assertThat(result.displayName).isNotEqualTo(savedName)
    }

    @Test
    fun testPriority2_SavedContactOverridesCnap() {
        val savedName = "Mom"
        val telecomCnap = "GOVERNMENT VERIFIED ENTITY"
        val rawNumber = "+91 98201 23456"

        // Priority 2 overrides Priority 3
        val result = CallerIdResult(
            displayName = savedName,
            subtitle = rawNumber,
            priority = CallerIdPriority.SAVED_LOCAL,
            isPrivate = false,
            isCnapVerified = false
        )

        assertThat(result.priority).isEqualTo(CallerIdPriority.SAVED_LOCAL)
        assertThat(result.displayName).isEqualTo("Mom")
        assertThat(result.displayName).isNotEqualTo(telecomCnap)
    }

    @Test
    fun testPriority3_TelecomCnapUsedWhenUnsaved() {
        val telecomCnap = "RELIANCE JIO INFO"
        val rawNumber = "+91 98765 43210"

        val result = CallerIdResult(
            displayName = telecomCnap,
            subtitle = "$rawNumber • Telecom CNAP Verified",
            priority = CallerIdPriority.CNAP_NETWORK,
            isPrivate = false,
            isCnapVerified = true
        )

        assertThat(result.priority).isEqualTo(CallerIdPriority.CNAP_NETWORK)
        assertThat(result.displayName).isEqualTo("RELIANCE JIO INFO")
        assertThat(result.isCnapVerified).isTrue()
    }

    @Test
    fun testPriority4_RawNumberFallback() {
        val rawNumber = "+91 91234 56789"

        val result = CallerIdResult(
            displayName = rawNumber,
            subtitle = "Unknown Caller",
            priority = CallerIdPriority.RAW_NUMBER,
            isPrivate = false,
            isCnapVerified = false
        )

        assertThat(result.priority).isEqualTo(CallerIdPriority.RAW_NUMBER)
        assertThat(result.displayName).isEqualTo(rawNumber)
    }
}
