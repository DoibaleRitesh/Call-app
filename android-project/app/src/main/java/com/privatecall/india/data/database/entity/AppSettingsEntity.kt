package com.privatecall.india.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "app_settings")
data class AppSettingsEntity(
    @PrimaryKey
    val id: Int = 1,
    val isBiometricEnabled: Boolean = true,
    val isPinEnabled: Boolean = true,
    val pinSalt: String = "",
    val pinHash: String = "",
    val autoLockMode: String = "immediate", // immediate, 1min, 5min
    val isCnapEnabled: Boolean = true
)
