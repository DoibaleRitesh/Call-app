package com.privatecall.india.data.repository

import com.privatecall.india.data.database.dao.AppSettingsDao
import com.privatecall.india.data.database.entity.AppSettingsEntity
import com.privatecall.india.domain.model.AppSettings
import com.privatecall.india.security.encryption.KeystoreManager
import com.privatecall.india.security.pin.PinSecurityManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

/**
 * Settings repository managing local security parameters, PIN hashing,
 * and hardware keystore encryption.
 */
class SettingsRepositoryImpl(
    private val appSettingsDao: AppSettingsDao,
    private val keystoreManager: KeystoreManager
) {

    fun getSettings(): Flow<AppSettingsEntity> {
        return appSettingsDao.getSettings().map { entity ->
            entity ?: AppSettingsEntity(
                id = 1,
                isBiometricEnabled = true,
                isPinEnabled = true,
                pinSalt = "",
                pinHash = "",
                autoLockMode = "immediate",
                isCnapEnabled = true
            )
        }
    }

    suspend fun savePin(pin: String) = withContext(Dispatchers.IO) {
        val current = getSettings().first()
        val salt = PinSecurityManager.generateSalt()
        val hash = PinSecurityManager.hashPin(pin, salt)

        appSettingsDao.saveSettings(
            current.copy(
                pinSalt = salt,
                pinHash = hash,
                isPinEnabled = true
            )
        )
    }

    suspend fun verifyPin(inputPin: String): Boolean = withContext(Dispatchers.IO) {
        val current = getSettings().first()
        if (current.pinHash.isBlank() || current.pinSalt.isBlank()) {
            return@withContext false
        }
        PinSecurityManager.verifyPin(inputPin, current.pinSalt, current.pinHash)
    }

    suspend fun updateAutoLockMode(mode: String) = withContext(Dispatchers.IO) {
        val current = getSettings().first()
        appSettingsDao.saveSettings(current.copy(autoLockMode = mode))
    }

    suspend fun toggleBiometric(enabled: Boolean) = withContext(Dispatchers.IO) {
        val current = getSettings().first()
        appSettingsDao.saveSettings(current.copy(isBiometricEnabled = enabled))
    }

    suspend fun toggleCnap(enabled: Boolean) = withContext(Dispatchers.IO) {
        val current = getSettings().first()
        appSettingsDao.saveSettings(current.copy(isCnapEnabled = enabled))
    }
}
