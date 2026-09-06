package com.privatecall.india.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.privatecall.india.data.database.dao.AppSettingsDao
import com.privatecall.india.data.database.dao.PrivateCallRecordDao
import com.privatecall.india.data.database.dao.PrivateContactDao
import com.privatecall.india.data.database.entity.AppSettingsEntity
import com.privatecall.india.data.database.entity.PrivateCallRecordEntity
import com.privatecall.india.data.database.entity.PrivateContactEntity

/**
 * 100% Local Room database for PrivateCall India.
 * Stores minimal metadata for hidden contacts and separate private call records.
 */
@Database(
    entities = [
        PrivateContactEntity::class,
        PrivateCallRecordEntity::class,
        AppSettingsEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun privateContactDao(): PrivateContactDao
    abstract fun privateCallRecordDao(): PrivateCallRecordDao
    abstract fun appSettingsDao(): AppSettingsDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "call_private_local.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
