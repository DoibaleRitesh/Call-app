package com.privatecall.india.ui.navigation

import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.privatecall.india.MainActivity
import com.privatecall.india.ui.contacts.ContactsScreen
import com.privatecall.india.ui.dialer.DialerScreen
import com.privatecall.india.ui.favorites.FavoritesScreen
import com.privatecall.india.ui.recents.RecentsScreen
import com.privatecall.india.ui.settings.SettingsScreen
import com.privatecall.india.ui.vault.PrivateVaultScreen

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Recents : Screen("recents", "Recents", Icons.Filled.History)
    object Contacts : Screen("contacts", "Contacts", Icons.Filled.Contacts)
    object Favorites : Screen("favorites", "Favorites", Icons.Filled.Star)
    object Dialer : Screen("dialer", "Keypad", Icons.Filled.Dialpad)
    object Vault : Screen("vault", "Private Vault", Icons.Filled.Lock)
    object Settings : Screen("settings", "Settings", Icons.Filled.Settings)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NavGraph(
    startInVault: Boolean = false
) {
    val context = LocalContext.current
    var currentScreen by remember { mutableStateOf<Screen>(if (startInVault) Screen.Vault else Screen.Contacts) }
    var searchQuery by remember { mutableStateOf("") }

    // Control FLAG_SECURE on activity window when in Private Vault
    LaunchedEffect(currentScreen) {
        val activity = context as? MainActivity
        activity?.setSecureScreenEnabled(currentScreen == Screen.Vault)
    }

    val onCallNumber: (String) -> Unit = { rawNumber ->
        val intent = Intent(Intent.ACTION_CALL).apply {
            data = Uri.parse("tel:${Uri.encode(rawNumber)}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        try {
            context.startActivity(intent)
        } catch (e: SecurityException) {
            val dialIntent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:${Uri.encode(rawNumber)}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(dialIntent)
        }
    }

    Scaffold(
        topBar = {
            if (currentScreen != Screen.Vault && currentScreen != Screen.Settings) {
                TopAppBar(
                    title = {
                        Text(
                            text = "Call",
                            style = MaterialTheme.typography.titleLarge
                        )
                    },
                    actions = {
                        IconButton(onClick = { currentScreen = Screen.Vault }) {
                            Icon(
                                imageVector = Icons.Outlined.Shield,
                                contentDescription = "Private Vault",
                                tint = MaterialTheme.colorScheme.tertiary
                            )
                        }
                        IconButton(onClick = { currentScreen = Screen.Settings }) {
                            Icon(
                                imageVector = Icons.Outlined.Settings,
                                contentDescription = "Settings"
                            )
                        }
                    }
                )
            }
        },
        bottomBar = {
            if (currentScreen != Screen.Vault && currentScreen != Screen.Settings) {
                NavigationBar {
                    val items = listOf(
                        Screen.Recents,
                        Screen.Contacts,
                        Screen.Favorites,
                        Screen.Dialer
                    )
                    items.forEach { screen ->
                        NavigationBarItem(
                            icon = { Icon(screen.icon, contentDescription = screen.title) },
                            label = { Text(screen.title) },
                            selected = currentScreen == screen,
                            onClick = { currentScreen = screen }
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (currentScreen) {
                Screen.Recents -> RecentsScreen(onCall = onCallNumber)
                Screen.Contacts -> ContactsScreen(
                    searchQuery = searchQuery,
                    onSearchQueryChange = { searchQuery = it },
                    onCall = onCallNumber
                )
                Screen.Favorites -> FavoritesScreen(onCall = onCallNumber)
                Screen.Dialer -> DialerScreen(onCall = onCallNumber)
                Screen.Vault -> PrivateVaultScreen(
                    onExit = { currentScreen = Screen.Contacts },
                    onCall = onCallNumber
                )
                Screen.Settings -> SettingsScreen(
                    onBack = { currentScreen = Screen.Contacts }
                )
            }
        }
    }
}
