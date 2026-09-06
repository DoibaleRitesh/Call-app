package com.privatecall.india

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.privatecall.india.shortcuts.PrivateShortcutManager
import com.privatecall.india.ui.navigation.NavGraph
import com.privatecall.india.ui.theme.CallTheme
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Root Activity for Call.
 * Manages FLAG_SECURE window privacy, background auto-lock lifecycle,
 * and shortcut intent dispatching.
 */
class MainActivity : ComponentActivity() {

    private var backgroundTimestamp: Long = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        // Publish dynamic zero-leak shortcut
        PrivateShortcutManager.publishDynamicShortcut(this)

        val shouldOpenVaultDirectly = intent?.action == "com.privatecall.india.ACTION_PRIVATE_VAULT"

        setContent {
            CallTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    NavGraph(
                        startInVault = shouldOpenVaultDirectly
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Evaluate auto-lock policy when returning from background
        if (backgroundTimestamp > 0) {
            val elapsed = System.currentTimeMillis() - backgroundTimestamp
            lifecycleScope.launch {
                val settings = CallApplication.instance.settingsRepository.getSettings().first()
                val lockThreshold = when (settings.autoLockMode) {
                    "immediate" -> 0L
                    "1min" -> 60_000L
                    "5min" -> 300_000L
                    else -> 0L
                }
                if (elapsed >= lockThreshold) {
                    // Signal state flow to lock vault
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        backgroundTimestamp = System.currentTimeMillis()
    }

    /**
     * Prevents private data exposure in Android system task switcher / recent apps previews.
     */
    fun setSecureScreenEnabled(enabled: Boolean) {
        if (enabled) {
            window.setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE
            )
        } else {
            window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }
    }
}
