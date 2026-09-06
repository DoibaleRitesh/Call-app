package com.privatecall.india

import android.app.Application
import com.privatecall.india.data.database.AppDatabase
import com.privatecall.india.data.repository.ContactsRepositoryImpl
import com.privatecall.india.data.repository.CallLogRepositoryImpl
import com.privatecall.india.data.repository.SettingsRepositoryImpl
import com.privatecall.india.security.encryption.KeystoreManager

/**
 * Main Application class for Call (PrivateCall India).
 * Initializes local offline Room database and Keystore hardware encryption.
 */
class CallApplication : Application() {

    lateinit var database: AppDatabase
        private set

    lateinit var contactsRepository: ContactsRepositoryImpl
        private set

    lateinit var callLogRepository: CallLogRepositoryImpl
        private set

    lateinit var settingsRepository: SettingsRepositoryImpl
        private set

    lateinit var keystoreManager: KeystoreManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize local encrypted hardware keystore
        keystoreManager = KeystoreManager(this)

        // Offline Room Database
        database = AppDatabase.getInstance(this)

        // Clean Architecture Repositories
        settingsRepository = SettingsRepositoryImpl(database.appSettingsDao(), keystoreManager)
        contactsRepository = ContactsRepositoryImpl(this, database.privateContactDao())
        callLogRepository = CallLogRepositoryImpl(this, database.privateCallRecordDao(), database.privateContactDao())
    }

    companion object {
        lateinit var instance: CallApplication
            private set
    }
}
