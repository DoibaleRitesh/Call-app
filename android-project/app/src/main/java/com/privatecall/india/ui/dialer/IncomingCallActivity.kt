package com.privatecall.india.ui.dialer

import android.os.Bundle
import android.telecom.Call
import android.telecom.VideoProfile
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CallEnd
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.privatecall.india.CallApplication
import com.privatecall.india.domain.model.CallerIdPriority
import com.privatecall.india.domain.model.CallerIdResult
import com.privatecall.india.telephony.cnap.CnapResolver
import com.privatecall.india.telephony.incoming.CallInCallService
import com.privatecall.india.ui.theme.CallTheme
import kotlinx.coroutines.launch

class IncomingCallActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Show over lockscreen and keep screen on
        setShowWhenLocked(true)
        setTurnScreenOn(true)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        val activeCall = CallInCallService.activeCall
        val rawNumber = activeCall?.details?.handle?.schemeSpecificPart ?: "Unknown Number"

        setContent {
            CallTheme {
                var callerResult by remember {
                    mutableStateOf(
                        CallerIdResult(
                            displayName = "Incoming Call",
                            subtitle = rawNumber,
                            priority = CallerIdPriority.RAW_NUMBER,
                            isPrivate = false,
                            isCnapVerified = false
                        )
                    )
                }

                LaunchedEffect(rawNumber) {
                    val resolver = CnapResolver(
                        this@IncomingCallActivity,
                        CallApplication.instance.database.privateContactDao()
                    )
                    val result = resolver.resolveIncomingCaller(rawNumber, activeCall)
                    callerResult = result

                    // If caller is a Private Contact, strictly enforce FLAG_SECURE on window
                    if (result.isPrivate) {
                        window.setFlags(
                            WindowManager.LayoutParams.FLAG_SECURE,
                            WindowManager.LayoutParams.FLAG_SECURE
                        )
                    }
                }

                IncomingCallContent(
                    callerResult = callerResult,
                    onAnswer = {
                        activeCall?.answer(VideoProfile.STATE_AUDIO_ONLY)
                        finish()
                    },
                    onDecline = {
                        activeCall?.disconnect()
                        finish()
                    }
                )
            }
        }
    }
}

@Composable
fun IncomingCallContent(
    callerResult: CallerIdResult,
    onAnswer: () -> Unit,
    onDecline: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopCenter)
                .padding(top = 80.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = CircleShape,
                color = if (callerResult.isPrivate) Color(0xFF7C4DFF).copy(alpha = 0.2f) else Color.White.copy(alpha = 0.1f),
                modifier = Modifier.size(96.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    if (callerResult.isPrivate) {
                        Icon(
                            imageVector = Icons.Filled.Lock,
                            contentDescription = "Private Contact",
                            tint = Color(0xFFB388FF),
                            modifier = Modifier.size(48.dp)
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Filled.Call,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(44.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = callerResult.displayName,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = callerResult.subtitle,
                style = MaterialTheme.typography.bodyLarge,
                color = Color.LightGray,
                textAlign = TextAlign.Center
            )

            if (callerResult.isCnapVerified) {
                Spacer(modifier = Modifier.height(12.dp))
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = Color(0xFF2E7D32).copy(alpha = 0.3f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Verified,
                            contentDescription = null,
                            tint = Color(0xFF81C784),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Indian Telecom CNAP Verified",
                            color = Color(0xFFA5D6A7),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Bottom Answer & Reject Actions
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(bottom = 48.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            // Reject Button
            FloatingActionButton(
                onClick = onDecline,
                containerColor = Color(0xFFEF4444),
                contentColor = Color.White,
                modifier = Modifier.size(72.dp),
                shape = CircleShape
            ) {
                Icon(Icons.Filled.CallEnd, contentDescription = "Decline", modifier = Modifier.size(36.dp))
            }

            // Answer Button
            FloatingActionButton(
                onClick = onAnswer,
                containerColor = Color(0xFF22C55E),
                contentColor = Color.White,
                modifier = Modifier.size(72.dp),
                shape = CircleShape
            ) {
                Icon(Icons.Filled.Call, contentDescription = "Answer", modifier = Modifier.size(36.dp))
            }
        }
    }
}
