package com.privatecall.india.data.repository

import android.content.Context
import android.provider.CallLog
import com.privatecall.india.data.database.dao.PrivateCallRecordDao
import com.privatecall.india.data.database.dao.PrivateContactDao
import com.privatecall.india.data.database.entity.PrivateCallRecordEntity
import com.privatecall.india.domain.model.CallRecord
import com.privatecall.india.domain.model.CallType
import com.privatecall.india.domain.usecase.NormalizePhoneNumberUseCase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

/**
 * Clean Architecture repository for Call Logs.
 * Strictly reads from Android CallLog.Calls and excludes any call records
 * matching Private Contacts from the normal Recents view.
 *
 * CRITICAL PRIVACY RULE: Does NOT secretly modify or delete the Android system call log.
 */
class CallLogRepositoryImpl(
    private val context: Context,
    private val privateCallRecordDao: PrivateCallRecordDao,
    private val privateContactDao: PrivateContactDao
) {

    /**
     * Reads public call log from Android system CallLog, filtering out private contact calls.
     */
    fun getPublicCallLogsFlow(): Flow<List<CallRecord>> {
        val systemCallsFlow = flow {
            emit(fetchSystemCallLogs())
        }

        return systemCallsFlow.combine(privateContactDao.getAllPrivateContacts()) { calls, privateContacts ->
            val privateNumbers = privateContacts.map { it.normalizedPhoneNumber }.toSet()
            calls.filterNot { call ->
                val norm = NormalizePhoneNumberUseCase.normalizeIndian(call.phoneNumber)
                privateNumbers.contains(norm)
            }
        }.flowOn(Dispatchers.IO)
    }

    private suspend fun fetchSystemCallLogs(): List<CallRecord> = withContext(Dispatchers.IO) {
        val records = mutableListOf<CallRecord>()
        val contentResolver = context.contentResolver

        val projection = arrayOf(
            CallLog.Calls._ID,
            CallLog.Calls.CACHED_NAME,
            CallLog.Calls.NUMBER,
            CallLog.Calls.TYPE,
            CallLog.Calls.DATE,
            CallLog.Calls.DURATION
        )

        try {
            val cursor = contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                projection,
                null,
                null,
                CallLog.Calls.DATE + " DESC LIMIT 150"
            )

            cursor?.use { c ->
                val idIndex = c.getColumnIndex(CallLog.Calls._ID)
                val nameIndex = c.getColumnIndex(CallLog.Calls.CACHED_NAME)
                val numIndex = c.getColumnIndex(CallLog.Calls.NUMBER)
                val typeIndex = c.getColumnIndex(CallLog.Calls.TYPE)
                val dateIndex = c.getColumnIndex(CallLog.Calls.DATE)
                val durIndex = c.getColumnIndex(CallLog.Calls.DURATION)

                while (c.moveToNext()) {
                    val id = c.getString(idIndex) ?: ""
                    val name = c.getString(nameIndex)
                    val number = c.getString(numIndex) ?: ""
                    val typeInt = c.getInt(typeIndex)
                    val date = c.getLong(dateIndex)
                    val duration = c.getLong(durIndex)

                    val callType = when (typeInt) {
                        CallLog.Calls.INCOMING_TYPE -> CallType.INCOMING
                        CallLog.Calls.OUTGOING_TYPE -> CallType.OUTGOING
                        CallLog.Calls.MISSED_TYPE -> CallType.MISSED
                        CallLog.Calls.REJECTED_TYPE -> CallType.REJECTED
                        else -> CallType.INCOMING
                    }

                    records.add(
                        CallRecord(
                            id = id,
                            contactName = name,
                            phoneNumber = number,
                            callType = callType,
                            timestamp = date,
                            durationSeconds = duration,
                            isPrivate = false
                        )
                    )
                }
            }
        } catch (e: SecurityException) {
            // Permission not granted or restricted
        }
        records
    }

    /**
     * Reads private call history from local Room database for the Private Vault.
     */
    fun getPrivateCallLogsFlow(): Flow<List<CallRecord>> {
        return privateCallRecordDao.getAllPrivateCalls().map { entities ->
            entities.map { entity ->
                val callType = when (entity.callType) {
                    "incoming" -> CallType.INCOMING
                    "outgoing" -> CallType.OUTGOING
                    "missed" -> CallType.MISSED
                    else -> CallType.OUTGOING
                }
                CallRecord(
                    id = entity.id.toString(),
                    contactId = entity.privateContactId,
                    contactName = entity.contactName,
                    phoneNumber = entity.phoneNumber,
                    callType = callType,
                    timestamp = entity.timestamp,
                    durationSeconds = entity.durationSeconds,
                    isPrivate = true
                )
            }
        }.flowOn(Dispatchers.IO)
    }

    suspend fun logPrivateCall(
        privateContactId: String,
        contactName: String?,
        phoneNumber: String,
        callType: String,
        durationSeconds: Long
    ) = withContext(Dispatchers.IO) {
        privateCallRecordDao.insert(
            PrivateCallRecordEntity(
                privateContactId = privateContactId,
                phoneNumber = phoneNumber,
                contactName = contactName,
                callType = callType,
                timestamp = System.currentTimeMillis(),
                durationSeconds = durationSeconds
            )
        )
    }
}
