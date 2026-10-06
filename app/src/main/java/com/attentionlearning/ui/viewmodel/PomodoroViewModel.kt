package com.attentionlearning.ui.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class PomodoroViewModel : ViewModel() {
    var timeLeftSeconds by mutableIntStateOf(25 * 60)
        private set

    var isRunning by mutableStateOf(false)
        private set

    private var timerJob: Job? = null

    fun startOrPause() {
        if (isRunning) {
            isRunning = false
            timerJob?.cancel()
            return
        }

        if (timeLeftSeconds <= 0) {
            timeLeftSeconds = 25 * 60
        }

        isRunning = true
        timerJob = viewModelScope.launch {
            while (isRunning && timeLeftSeconds > 0) {
                delay(1000L)
                timeLeftSeconds--
            }

            if (timeLeftSeconds == 0) {
                isRunning = false
            }
        }
    }

    fun reset() {
        isRunning = false
        timerJob?.cancel()
        timeLeftSeconds = 25 * 60
    }

    fun formatTime(): String {
        val minutes = timeLeftSeconds / 60
        val seconds = timeLeftSeconds % 60
        return "%02d:%02d".format(minutes, seconds)
    }
}
