package com.privatecall.india.telephony.incoming

import android.content.Intent
import android.telecom.Call
import android.telecom.InCallService
import com.privatecall.india.ui.dialer.IncomingCallActivity

/**
 * InCallService for Android default phone app role.
 * Receives incoming & outgoing call state events directly from TelecomManager.
 */
class CallInCallService : InCallService() {

    override fun onCallAdded(call: Call) {
        super.onCallAdded(call)
        activeCall = call

        if (call.state == Call.STATE_RINGING) {
            // Launch full-screen incoming call UI
            val intent = Intent(this, IncomingCallActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(intent)
        }
    }

    override fun onCallRemoved(call: Call) {
        super.onCallRemoved(call)
        if (activeCall == call) {
            activeCall = null
        }
    }

    companion object {
        var activeCall: Call? = null
    }
}
