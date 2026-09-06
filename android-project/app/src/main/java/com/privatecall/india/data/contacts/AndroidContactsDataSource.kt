package com.privatecall.india.data.contacts

import android.content.Context
import android.provider.ContactsContract
import com.privatecall.india.domain.model.Contact
import com.privatecall.india.domain.usecase.NormalizePhoneNumberUseCase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Reads local Android/Google contacts using ContactsContract.
 * Does NOT modify, rename, or delete the user's original contacts.
 */
class AndroidContactsDataSource(private val context: Context) {

    suspend fun fetchLocalContacts(): List<Contact> = withContext(Dispatchers.IO) {
        val contactsMap = mutableMapOf<String, Contact>()
        val contentResolver = context.contentResolver

        val projection = arrayOf(
            ContactsContract.CommonDataKinds.Phone.CONTACT_ID,
            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME_PRIMARY,
            ContactsContract.CommonDataKinds.Phone.NUMBER,
            ContactsContract.CommonDataKinds.Phone.PHOTO_THUMBNAIL_URI,
            ContactsContract.CommonDataKinds.Phone.STARRED
        )

        val cursor = contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            projection,
            null,
            null,
            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME_PRIMARY + " ASC"
        )

        cursor?.use { c ->
            val idIndex = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.CONTACT_ID)
            val nameIndex = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME_PRIMARY)
            val numIndex = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)
            val photoIndex = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.PHOTO_THUMBNAIL_URI)
            val starredIndex = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.STARRED)

            while (c.moveToNext()) {
                val id = c.getString(idIndex)
                val name = c.getString(nameIndex) ?: "Unknown"
                val rawNumber = c.getString(numIndex) ?: ""
                val photoUri = c.getString(photoIndex)
                val isStarred = c.getInt(starredIndex) == 1

                val existing = contactsMap[id]
                if (existing != null) {
                    if (!existing.phoneNumbers.contains(rawNumber)) {
                        contactsMap[id] = existing.copy(
                            phoneNumbers = existing.phoneNumbers + rawNumber
                        )
                    }
                } else {
                    contactsMap[id] = Contact(
                        id = id,
                        name = name,
                        phoneNumbers = listOf(rawNumber),
                        photoUri = photoUri,
                        isFavorite = isStarred,
                        isPrivate = false,
                        normalizedNumber = NormalizePhoneNumberUseCase.normalizeIndian(rawNumber)
                    )
                }
            }
        }
        contactsMap.values.toList()
    }
}
