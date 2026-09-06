package com.privatecall.india.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Isolated call record for calls involving private contacts.
 * Stored locally and kept completely segregated from the normal Recents view.
 */
@Entity(tableName = "private_call_records")
data class PrivateCallRecordEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val privateContactId: String,
    val phoneNumber: String,
    val contactName: String?,
    val callType: String, // "incoming", "outgoing", "missed", "rejected"
    val timestamp: Long,
    val durationSeconds: Long = 0
)
