package com.privatecall.india.ui.settings

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telecom.TelecomManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.privatecall.india.CallApplication
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val settingsRepository = remember { CallApplication.instance.settingsRepository }
    val settings by settingsRepository.getSettings().collectAsState(initial = null)

    var isDefaultDialer by remember {
        mutableStateOf(checkIsDefaultDialer(context))
    }

    val roleLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) {
        isDefaultDialer = checkIsDefaultDialer(context)
    }

    val requestDefaultDialer: () -> Unit = {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = context.getSystemService(RoleManager::class.java)
            if (roleManager?.isRoleAvailable(RoleManager.ROLE_DIAL) == true) {
                val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_DIAL)
                roleLauncher.launch(intent)
            }
        } else {
            val intent = Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER).apply {
                putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, context.packageName)
            }
            roleLauncher.launch(intent)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Privacy") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Default Phone App Section
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (isDefaultDialer) Icons.Filled.CheckCircle else Icons.Outlined.PhoneInTalk,
                            contentDescription = null,
                            tint = if (isDefaultDialer) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Default Phone Application",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (isDefaultDialer) "Active default dialer" else "Not set as default phone app",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    if (!isDefaultDialer) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Required for InCallService incoming call screen, lockscreen caller ID, and telecom CNAP presentation.",
                            style = MaterialTheme.typography.bodySmall
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = requestDefaultDialer,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Set as Default Phone App")
                        }
                    }
                }
            }

            // India Telecom CNAP Settings
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Indian Telecom CNAP Caller ID",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Uses SIM & operator Calling Name Presentation where supported by telecom network. No internet, Truecaller, or external APIs.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = settings?.isCnapEnabled ?: true,
                            onCheckedChange = { enabled ->
                                coroutineScope.launch {
                                    settingsRepository.toggleCnap(enabled)
                                }
                            }
                        )
                    }
                }
            }

            // Security & Privacy Section
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Vault Protection",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Biometric Authentication", style = MaterialTheme.typography.bodyLarge)
                            Text("Fingerprint or Face Unlock", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Switch(
                            checked = settings?.isBiometricEnabled ?: true,
                            onCheckedChange = { enabled ->
                                coroutineScope.launch {
                                    settingsRepository.toggleBiometric(enabled)
                                }
                            }
                        )
                    }

                    Divider(modifier = Modifier.padding(vertical = 12.dp))

                    Text("Auto-Lock Timeout", style = MaterialTheme.typography.bodyLarge)
                    Text("Lock Private Vault when app goes to background", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(8.dp))

                    val modes = listOf("immediate" to "Immediate", "1min" to "1 Minute", "5min" to "5 Minutes")
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        modes.forEach { (key, label) ->
                            FilterChip(
                                selected = (settings?.autoLockMode ?: "immediate") == key,
                                onClick = {
                                    coroutineScope.launch {
                                        settingsRepository.updateAutoLockMode(key)
                                    }
                                },
                                label = { Text(label) }
                            )
                        }
                    }
                }
            }

            // Local-Only Privacy Guarantee
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Security,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "100% Offline & Local. No cloud databases, no analytics, no external servers, and zero dummy data.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

private fun checkIsDefaultDialer(context: Context): Boolean {
    val telecomManager = context.getSystemService(TelecomManager::class.java)
    return telecomManager?.defaultDialerPackage == context.packageName
}
