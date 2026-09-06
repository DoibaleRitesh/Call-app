package com.privatecall.india.telephony.cnap

import android.content.Context
import android.telecom.Call
import com.privatecall.india.data.database.dao.PrivateContactDao
import com.privatecall.india.domain.model.CallerIdPriority
import com.privatecall.india.domain.model.CallerIdResult
import com.privatecall.india.domain.usecase.NormalizePhoneNumberUseCase

/**
 * Strict Calling Name Presentation (CNAP) Resolver implementing exact Indian telecom priority:
 *
 * 1. Is it a Private Contact?
 *    YES -> Show "Private Contact" (+91 XXXXX XXXXX). Hide saved name!
 *
 * 2. Is it saved locally?
 *    YES -> Show saved contact name.
 *
 * 3. Does telecom/network provide CNAP name? (via Call.Details.getCallerDisplayName())
 *    YES -> Show CNAP name (telecom-verified).
 *
 * 4. Fallback:
 *    Show normalized phone number.
 */
class CnapResolver(
    private val context: Context,
    private val privateContactDao: PrivateContactDao
) {

    suspend fun resolveIncomingCaller(
        rawNumber: String,
        telecomCall: Call? = null,
        localContacts: Map<String, String> = emptyMap()
    ): CallerIdResult {
        val normalized = NormalizePhoneNumberUseCase.normalizeIndian(rawNumber)
        val formattedNumber = NormalizePhoneNumberUseCase.formatDisplayIndian(rawNumber)

        // Priority 1: Check if number belongs to Private Contact
        val privateEntity = privateContactDao.getByNormalizedNumber(normalized)
        if (privateEntity != null) {
            return CallerIdResult(
                displayName = "Private Contact",
                subtitle = formattedNumber,
                priority = CallerIdPriority.PRIVATE,
                isPrivate = true,
                isCnapVerified = false
            )
        }

        // Priority 2: Check local saved contacts
        val savedName = localContacts[normalized]
        if (!savedName.isNullOrBlank()) {
            return CallerIdResult(
                displayName = savedName,
                subtitle = formattedNumber,
                priority = CallerIdPriority.SAVED_LOCAL,
                isPrivate = false,
                isCnapVerified = false
            )
        }

        // Priority 3: Check Android Telecom CNAP (Caller Name Presentation)
        val telecomCnapName = telecomCall?.details?.callerDisplayName
        if (!telecomCnapName.isNullOrBlank()) {
            return CallerIdResult(
                displayName = telecomCnapName.trim().uppercase(),
                subtitle = "$formattedNumber • Telecom CNAP Verified",
                priority = CallerIdPriority.CNAP_NETWORK,
                isPrivate = false,
                isCnapVerified = true
            )
        }

        // Priority 4: Fallback to Raw Number
        return CallerIdResult(
            displayName = formattedNumber,
            subtitle = "Unknown Caller",
            priority = CallerIdPriority.RAW_NUMBER,
            isPrivate = false,
            isCnapVerified = false
        )
    }
}
