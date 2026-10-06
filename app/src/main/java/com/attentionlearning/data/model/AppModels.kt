package com.attentionlearning.data.model

data class DailyLog(
    val id: String,
    val title: String,
    val note: String,
    val mood: String,
    val focusScore: Int,
    val date: String
)

data class StudentProfile(
    val id: String,
    val name: String,
    val campus: String,
    val hobbies: List<String>,
    val studyStyle: String
)

data class StudyGroup(
    val id: String,
    val name: String,
    val subject: String,
    val members: Int,
    val nextMeeting: String
)

data class MemoryExercise(
    val title: String,
    val description: String,
    val difficulty: String
)

data class ProgressItem(
    val label: String,
    val value: String,
    val change: String
)
