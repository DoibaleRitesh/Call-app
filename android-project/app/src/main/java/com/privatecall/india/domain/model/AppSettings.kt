package com.privatecall.india.domain.model

data class AppSettings(
    val isBiometricEnabled: Boolean = true,
    val isPinEnabled: Boolean = true,
    val autoLockMode: String = "immediate", // "immediate", "1min", "5min"
    val isCnapEnabled: Boolean = true,
    val hasConfiguredPin: Boolean = false
)
