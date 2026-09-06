package com.privatecall.india.shortcuts

import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import com.privatecall.india.MainActivity
import com.privatecall.india.R

/**
 * Creates dynamic home-screen shortcut for fast access to the Private Vault.
 * CRITICAL PRIVACY GUARANTEE: Contains zero contact names, numbers, or history in metadata.
 */
object PrivateShortcutManager {

    const val SHORTCUT_ID = "shortcut_private_vault"

    fun publishDynamicShortcut(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            val shortcutManager = context.getSystemService(ShortcutManager::class.java) ?: return

            val intent = Intent(context, MainActivity::class.java).apply {
                action = "com.privatecall.india.ACTION_PRIVATE_VAULT"
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

            val shortcut = ShortcutInfo.Builder(context, SHORTCUT_ID)
                .setShortLabel("Vault")
                .setLongLabel("Private Contacts Vault")
                .setIcon(Icon.createWithResource(context, R.drawable.ic_shortcut_security))
                .setIntent(intent)
                .build()

            shortcutManager.dynamicShortcuts = listOf(shortcut)
        }
    }
}
