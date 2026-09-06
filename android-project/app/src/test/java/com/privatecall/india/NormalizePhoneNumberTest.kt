package com.privatecall.india

import com.google.common.truth.Truth.assertThat
import com.privatecall.india.domain.usecase.NormalizePhoneNumberUseCase
import org.junit.Test

class NormalizePhoneNumberTest {

    @Test
    fun testIndianNumberVariationsNormalizeIdentically() {
        val plus91 = "+91 98201 23456"
        val prefix91 = "919820123456"
        val prefixZero = "09820123456"
        val plain10 = "9820123456"

        val expected = "9820123456"

        assertThat(NormalizePhoneNumberUseCase.normalizeIndian(plus91)).isEqualTo(expected)
        assertThat(NormalizePhoneNumberUseCase.normalizeIndian(prefix91)).isEqualTo(expected)
        assertThat(NormalizePhoneNumberUseCase.normalizeIndian(prefixZero)).isEqualTo(expected)
        assertThat(NormalizePhoneNumberUseCase.normalizeIndian(plain10)).isEqualTo(expected)
    }

    @Test
    fun testDifferentNumbersDoNotMerge() {
        val num1 = "9820123456"
        val num2 = "9820123457"
        assertThat(NormalizePhoneNumberUseCase.normalizeIndian(num1))
            .isNotEqualTo(NormalizePhoneNumberUseCase.normalizeIndian(num2))
    }
}
