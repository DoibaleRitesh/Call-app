package com.privatecall.india.data.database.dao

import androidx.room.*
import com.privatecall.india.data.database.entity.PrivateContactEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PrivateContactDao {

    @Query("SELECT * FROM private_contacts")
    fun getAllPrivateContacts(): Flow<List<PrivateContactEntity>>

    @Query("SELECT androidContactId FROM private_contacts")
    fun getAllPrivateContactIds(): Flow<List<String>>

    @Query("SELECT * FROM private_contacts WHERE androidContactId = :contactId LIMIT 1")
    suspend fun getByContactId(contactId: String): PrivateContactEntity?

    @Query("SELECT * FROM private_contacts WHERE normalizedPhoneNumber = :normalizedNumber LIMIT 1")
    suspend fun getByNormalizedNumber(normalizedNumber: String): PrivateContactEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: PrivateContactEntity): Long

    @Query("DELETE FROM private_contacts WHERE androidContactId = :contactId")
    suspend fun deleteByContactId(contactId: String)
}
