package com.privatecall.india.data.database.dao

import androidx.room.*
import com.privatecall.india.data.database.entity.PrivateCallRecordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PrivateCallRecordDao {

    @Query("SELECT * FROM private_call_records ORDER BY timestamp DESC")
    fun getAllPrivateCalls(): Flow<List<PrivateCallRecordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: PrivateCallRecordEntity): Long

    @Query("DELETE FROM private_call_records WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM private_call_records")
    suspend fun clearAll()
}
