package com.attentionlearning

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.attentionlearning.ui.theme.AttentionLearningTheme
import com.attentionlearning.ui.navigation.AttentionLearningNavHost

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AttentionLearningTheme {
                AttentionLearningNavHost()
            }
        }
    }
}
