package com.privatecall.india.domain.model

enum class CallType {
    INCOMING,
    OUTGOING,
    MISSED,
    REJECTED
}

/**
 * Domain representation of a phone call record.
 * Used for both public recents (queried from CallLog.Calls) and private call history (Room).
 */
data class CallRecord(
    val id: String,
    val contactId: String? = null,
    val contactName: String? = null,
    val phoneNumber: String,
    val callType: CallType,
    val timestamp: Long,
    val durationSeconds: Long = 0L,
    val isPrivate: Boolean = false,
    val simSlot: Int = 1
)
