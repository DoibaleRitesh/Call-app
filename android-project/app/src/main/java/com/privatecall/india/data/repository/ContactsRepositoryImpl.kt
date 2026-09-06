package com.privatecall.india.data.repository

import android.content.Context
import com.privatecall.india.data.contacts.AndroidContactsDataSource
import com.privatecall.india.data.database.dao.PrivateContactDao
import com.privatecall.india.data.database.entity.PrivateContactEntity
import com.privatecall.india.domain.model.Contact
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext

/**
 * Clean Architecture repository for Contacts.
 * Strictly reads from Android ContactsContract and filters out all Private Contacts.
 * Never modifies or deletes records in the user's Android system contacts database.
 */
class ContactsRepositoryImpl(
    private val context: Context,
    private val privateContactDao: PrivateContactDao
) {
    private val dataSource = AndroidContactsDataSource(context)

    /**
     * Public contacts flow: Real device contacts excluding any contact marked private.
     */
    fun getPublicContactsFlow(): Flow<List<Contact>> {
        val localContactsFlow = flow {
            emit(dataSource.fetchLocalContacts())
        }

        return localContactsFlow.combine(privateContactDao.getAllPrivateContactIds()) { contacts, privateIds ->
            val privateSet = privateIds.toSet()
            contacts.filterNot { privateSet.contains(it.id) }
        }.flowOn(Dispatchers.IO)
    }

    /**
     * Fetches private contacts for the authenticated Private Vault only.
     */
    suspend fun getPrivateContacts(): List<Contact> = withContext(Dispatchers.IO) {
        val allLocal = dataSource.fetchLocalContacts()
        val privateEntities = privateContactDao.getByNormalizedNumber("") // placeholder
        // Fetch all private contacts by reading full list from local contacts matching private IDs
        val contactsMap = allLocal.associateBy { it.id }
        // We will collect from privateContactDao
        emptyList()
    }

    fun getPrivateContactsFlow(): Flow<List<Contact>> {
        val localContactsFlow = flow {
            emit(dataSource.fetchLocalContacts())
        }
        return localContactsFlow.combine(privateContactDao.getAllPrivateContacts()) { allContacts, privateEntities ->
            val privateIds = privateEntities.map { it.androidContactId }.toSet()
            allContacts.filter { privateIds.contains(it.id) }.map { it.copy(isPrivate = true) }
        }.flowOn(Dispatchers.IO)
    }

    suspend fun markContactAsPrivate(contact: Contact) = withContext(Dispatchers.IO) {
        privateContactDao.insert(
            PrivateContactEntity(
                androidContactId = contact.id,
                normalizedPhoneNumber = contact.normalizedNumber
            )
        )
    }

    suspend fun unmarkContactAsPrivate(contactId: String) = withContext(Dispatchers.IO) {
        privateContactDao.deleteByContactId(contactId)
    }

    suspend fun isPrivateNumber(normalizedNumber: String): Boolean = withContext(Dispatchers.IO) {
        privateContactDao.getByNormalizedNumber(normalizedNumber) != null
    }
}
