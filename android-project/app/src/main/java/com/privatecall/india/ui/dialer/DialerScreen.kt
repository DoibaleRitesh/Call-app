package com.privatecall.india.ui.dialer

import android.media.AudioManager
import android.media.ToneGenerator
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Backspace
import androidx.compose.material.icons.filled.Call
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.privatecall.india.CallApplication
import com.privatecall.india.domain.usecase.NormalizePhoneNumberUseCase

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun DialerScreen(
    onCall: (String) -> Unit
) {
    var inputNumber by remember { mutableStateOf("") }
    val toneGenerator = remember {
        try {
            ToneGenerator(AudioManager.STREAM_VOICE_CALL, 60)
        } catch (e: Exception) {
            null
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            toneGenerator?.release()
        }
    }

    val playTone: (Int) -> Unit = { tone ->
        try {
            toneGenerator?.startTone(tone, 120)
        } catch (e: Exception) {
            // Tone error ignored
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Formatted number display
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (inputNumber.isEmpty()) "Enter number" else NormalizePhoneNumberUseCase.formatDisplayIndian(inputNumber),
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                fontSize = if (inputNumber.length > 10) 24.sp else 32.sp,
                color = if (inputNumber.isEmpty()) MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f) else MaterialTheme.colorScheme.onSurface
            )
        }

        // 3x4 Dialpad Grid
        val keys = listOf(
            listOf(DialKey("1", "", ToneGenerator.TONE_DTMF_1), DialKey("2", "ABC", ToneGenerator.TONE_DTMF_2), DialKey("3", "DEF", ToneGenerator.TONE_DTMF_3)),
            listOf(DialKey("4", "GHI", ToneGenerator.TONE_DTMF_4), DialKey("5", "JKL", ToneGenerator.TONE_DTMF_5), DialKey("6", "MNO", ToneGenerator.TONE_DTMF_6)),
            listOf(DialKey("7", "PQRS", ToneGenerator.TONE_DTMF_7), DialKey("8", "TUV", ToneGenerator.TONE_DTMF_8), DialKey("9", "WXYZ", ToneGenerator.TONE_DTMF_9)),
            listOf(DialKey("*", "", ToneGenerator.TONE_DTMF_S), DialKey("0", "+", ToneGenerator.TONE_DTMF_0), DialKey("#", "", ToneGenerator.TONE_DTMF_P))
        )

        Column(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.padding(bottom = 12.dp)
        ) {
            keys.forEach { row ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    row.forEach { key ->
                        Surface(
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier
                                .size(68.dp)
                                .clip(CircleShape)
                                .combinedClickable(
                                    onClick = {
                                        inputNumber += key.digit
                                        playTone(key.tone)
                                    },
                                    onLongClick = {
                                        if (key.digit == "0") {
                                            inputNumber += "+"
                                            playTone(key.tone)
                                        }
                                    }
                                )
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = key.digit,
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.SemiBold
                                )
                                if (key.subtext.isNotEmpty()) {
                                    Text(
                                        text = key.subtext,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Bottom Actions: Backspace and Call Button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Spacer(modifier = Modifier.size(56.dp))

            FloatingActionButton(
                onClick = {
                    if (inputNumber.isNotEmpty()) {
                        onCall(inputNumber)
                    }
                },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.size(68.dp),
                shape = CircleShape
            ) {
                Icon(Icons.Filled.Call, contentDescription = "Call", modifier = Modifier.size(32.dp))
            }

            if (inputNumber.isNotEmpty()) {
                IconButton(
                    onClick = { inputNumber = inputNumber.dropLast(1) },
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(Icons.Filled.Backspace, contentDescription = "Backspace")
                }
            } else {
                Spacer(modifier = Modifier.size(56.dp))
            }
        }
    }
}

private data class DialKey(
    val digit: String,
    val subtext: String,
    val tone: Int
)
