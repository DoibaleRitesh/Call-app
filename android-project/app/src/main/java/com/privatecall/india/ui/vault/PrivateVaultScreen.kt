package com.privatecall.india.ui.vault

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.privatecall.india.CallApplication
import com.privatecall.india.domain.model.CallRecord
import com.privatecall.india.domain.model.Contact
import kotlinx.coroutines.launch

@Composable
fun PrivateVaultScreen(
    onExit: () -> Unit,
    onCall: (String) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val settingsRepository = remember { CallApplication.instance.settingsRepository }
    val contactsRepository = remember { CallApplication.instance.contactsRepository }
    val callLogRepository = remember { CallApplication.instance.callLogRepository }

    var isAuthenticated by remember { mutableStateOf(false) }
    var pinInput by remember { mutableStateOf("") }
    var pinError by remember { mutableStateOf(false) }
    var activeTab by remember { mutableStateOf(0) } // 0: Contacts, 1: History

    val privateContacts by contactsRepository.getPrivateContactsFlow().collectAsState(initial = emptyList())
    val privateCallLogs by callLogRepository.getPrivateCallLogsFlow().collectAsState(initial = emptyList())

    val settings by settingsRepository.getSettings().collectAsState(initial = null)

    // Trigger BiometricPrompt on launch if supported and enabled
    LaunchedEffect(settings) {
        val currentSettings = settings ?: return@LaunchedEffect
        if (currentSettings.isBiometricEnabled && !isAuthenticated) {
            val activity = context as? FragmentActivity ?: return@LaunchedEffect
            val executor = ContextCompat.getMainExecutor(context)
            val biometricPrompt = BiometricPrompt(
                activity,
                executor,
                object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        isAuthenticated = true
                    }
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        // Fall back to PIN entry
                    }
                }
            )

            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Unlock Private Vault")
                .setSubtitle("Authenticate using fingerprint or device biometric")
                .setNegativeButtonText("Use PIN")
                .build()

            try {
                biometricPrompt.authenticate(promptInfo)
            } catch (e: Exception) {
                // Biometrics unavailable on device
            }
        }
    }

    if (!isAuthenticated) {
        // PIN Authentication Pad
        Box(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Lock,
                        contentDescription = null,
                        modifier = Modifier.size(56.dp),
                        tint = MaterialTheme.colorScheme.tertiary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Private Vault",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Enter your secure PIN to access hidden contacts and segregated call history.",
                        style = MaterialTheme.typography.bodySmall,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    // PIN dots
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.padding(bottom = 24.dp)
                    ) {
                        for (i in 0 until 4) {
                            Surface(
                                shape = CircleShape,
                                color = if (i < pinInput.length) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                                modifier = Modifier.size(16.dp)
                            ) {}
                        }
                    }

                    if (pinError) {
                        Text(
                            text = "Incorrect PIN. Try again.",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(bottom = 12.dp)
                        )
                    }

                    // Keypad digits
                    val pinRows = listOf(
                        listOf("1", "2", "3"),
                        listOf("4", "5", "6"),
                        listOf("7", "8", "9"),
                        listOf("C", "0", "OK")
                    )

                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        pinRows.forEach { row ->
                            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                row.forEach { key ->
                                    Button(
                                        onClick = {
                                            when (key) {
                                                "C" -> {
                                                    pinInput = ""
                                                    pinError = false
                                                }
                                                "OK" -> {
                                                    coroutineScope.launch {
                                                        // Default PIN is 1234 if unconfigured
                                                        val valid = if (settings?.pinHash?.isEmpty() != false) {
                                                            pinInput == "1234"
                                                        } else {
                                                            settingsRepository.verifyPin(pinInput)
                                                        }
                                                        if (valid) {
                                                            isAuthenticated = true
                                                            pinError = false
                                                        } else {
                                                            pinError = true
                                                            pinInput = ""
                                                        }
                                                    }
                                                }
                                                else -> {
                                                    if (pinInput.length < 4) {
                                                        pinInput += key
                                                        pinError = false
                                                        if (pinInput.length == 4) {
                                                            coroutineScope.launch {
                                                                val valid = if (settings?.pinHash?.isEmpty() != false) {
                                                                    pinInput == "1234"
                                                                } else {
                                                                    settingsRepository.verifyPin(pinInput)
                                                                }
                                                                if (valid) {
                                                                    isAuthenticated = true
                                                                    pinError = false
                                                                } else {
                                                                    pinError = true
                                                                    pinInput = ""
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        modifier = Modifier.size(64.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = MaterialTheme.colorScheme.surface
                                        ),
                                        shape = CircleShape
                                    ) {
                                        Text(
                                            text = key,
                                            style = MaterialTheme.typography.titleMedium,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    TextButton(onClick = onExit) {
                        Text("Cancel and Return")
                    }
                }
            }
        }
    } else {
        // Authenticated Vault Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Lock,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.tertiary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Private Vault",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                }

                FilledTonalButton(
                    onClick = { isAuthenticated = false; onExit() },
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                ) {
                    Text("Lock", color = MaterialTheme.colorScheme.onErrorContainer)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            TabRow(selectedTabIndex = activeTab) {
                Tab(
                    selected = activeTab == 0,
                    onClick = { activeTab = 0 },
                    text = { Text("Hidden Contacts (${privateContacts.size})") }
                )
                Tab(
                    selected = activeTab == 1,
                    onClick = { activeTab = 1 },
                    text = { Text("Private History (${privateCallLogs.size})") }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (activeTab == 0) {
                if (privateContacts.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Outlined.Shield,
                                contentDescription = null,
                                modifier = Modifier.size(56.dp),
                                tint = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.5f)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No Private Contacts Added",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Mark any contact from the Contacts tab to hide them from normal view.",
                                style = MaterialTheme.typography.bodySmall,
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(privateContacts, key = { it.id }) { contact ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = contact.name,
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = contact.phoneNumbers.firstOrNull() ?: "",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }

                                    Row {
                                        IconButton(
                                            onClick = {
                                                coroutineScope.launch {
                                                    contactsRepository.unmarkContactAsPrivate(contact.id)
                                                }
                                            }
                                        ) {
                                            Icon(
                                                imageVector = Icons.Outlined.Visibility,
                                                contentDescription = "Unhide Contact",
                                                tint = MaterialTheme.colorScheme.primary
                                            )
                                        }

                                        IconButton(
                                            onClick = {
                                                val num = contact.phoneNumbers.firstOrNull() ?: ""
                                                coroutineScope.launch {
                                                    callLogRepository.logPrivateCall(
                                                        privateContactId = contact.id,
                                                        contactName = contact.name,
                                                        phoneNumber = num,
                                                        callType = "outgoing",
                                                        durationSeconds = 0
                                                    )
                                                }
                                                onCall(num)
                                            }
                                        ) {
                                            Icon(
                                                imageVector = Icons.Filled.Call,
                                                contentDescription = "Call",
                                                tint = MaterialTheme.colorScheme.primary
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (privateCallLogs.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(
                            text = "No private call history yet.",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(privateCallLogs, key = { it.id }) { record ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text(
                                            text = record.contactName ?: record.phoneNumber,
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Private ${record.callType.name.lowercase()} call",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.tertiary
                                        )
                                    }
                                    IconButton(onClick = { onCall(record.phoneNumber) }) {
                                        Icon(
                                            imageVector = Icons.Filled.Call,
                                            contentDescription = "Call",
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
