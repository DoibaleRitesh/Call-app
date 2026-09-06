package com.privatecall.india.domain.model

/**
 * Domain representation of a Contact.
 * Encapsulates read-only Android ContactsContract contact or private contact.
 */
data class Contact(
    val id: String,
    val name: String,
    val phoneNumbers: List<String>,
    val photoUri: String? = null,
    val isFavorite: Boolean = false,
    val isPrivate: Boolean = false,
    val normalizedNumber: String = ""
)
