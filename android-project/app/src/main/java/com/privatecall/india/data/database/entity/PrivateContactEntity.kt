package com.privatecall.india.data.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Stores only minimal identifier linking to the Android contact.
 * We deliberately avoid duplicating the complete contact record to respect privacy
 * and allow Android/Google Contacts to remain the single source of truth for public details.
 */
@Entity(
    tableName = "private_contacts",
    indices = [Index(value = ["androidContactId"], unique = true)]
)
data class PrivateContactEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val androidContactId: String,
    val normalizedPhoneNumber: String,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
