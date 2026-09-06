package com.privatecall.india.domain.model

enum class CallerIdPriority {
    PRIVATE,        // 1. Private contact -> neutral label
    SAVED_LOCAL,    // 2. Saved device contact
    CNAP_NETWORK,   // 3. Telecom / CNAP network verified
    RAW_NUMBER      // 4. Raw phone number fallback
}

data class CallerIdResult(
    val displayName: String,
    val subtitle: String,
    val priority: CallerIdPriority,
    val isPrivate: Boolean,
    val isCnapVerified: Boolean
)
