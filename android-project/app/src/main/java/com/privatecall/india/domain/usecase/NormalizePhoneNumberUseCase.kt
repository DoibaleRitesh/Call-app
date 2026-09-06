package com.privatecall.india.domain.usecase

/**
 * Standardizes Indian phone numbers across multiple formats:
 * +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX.
 * Preserves distinction between different valid numbers.
 */
object NormalizePhoneNumberUseCase {

    fun normalizeIndian(raw: String?): String {
        if (raw.isNullOrBlank()) return ""
        val digits = raw.filter { it.isDigit() }
        return when {
            digits.length == 12 && digits.startsWith("91") -> digits.substring(2)
            digits.length == 11 && digits.startsWith("0") -> digits.substring(1)
            digits.length == 10 -> digits
            digits.length > 10 -> digits.takeLast(10)
            else -> digits
        }
    }

    fun formatDisplayIndian(raw: String): String {
        val norm = normalizeIndian(raw)
        return if (norm.length == 10) {
            "+91 ${norm.substring(0, 5)} ${norm.substring(5)}"
        } else {
            raw
        }
    }
}
