package com.attentionlearning.data.repository

import com.attentionlearning.data.model.DailyLog
import com.attentionlearning.data.model.MemoryExercise
import com.attentionlearning.data.model.ProgressItem
import com.attentionlearning.data.model.StudentProfile
import com.attentionlearning.data.model.StudyGroup

class AppRepository {
    fun getStudentProfile(): StudentProfile = StudentProfile(
        id = "u1",
        name = "Ana Silva",
        campus = "Campus Central",
        hobbies = listOf("Música", "Corrida", "Leitura"),
        studyStyle = "Estudo em blocos + revisão ativa"
    )

    fun getDailyLogs(): List<DailyLog> = listOf(
        DailyLog("1", "Foco em matemática", "Consegui avançar na revisão de álgebra.", "Bom", 88, "Hoje"),
        DailyLog("2", "Leitura e resumo", "Revisão de capítulos e fichamentos de história.", "Neutro", 72, "Ontem"),
        DailyLog("3", "Muita energia", "Aula em grupo e treino no fim do dia.", "Excelente", 91, "2 dias atrás")
    )

    fun getMemoryExercises(): List<MemoryExercise> = listOf(
        MemoryExercise("Mapa mental", "Transforme o conteúdo em conexões visuais e palavras-chave.", "Médio"),
        MemoryExercise("Repetição espaçada", "Revise o material em intervalos curtos durante o dia.", "Fácil"),
        MemoryExercise("Perguntas de autoexplicação", "Explique o tema em voz alta como se fosse ensinar outra pessoa.", "Difícil")
    )

    fun getProgressItems(): List<ProgressItem> = listOf(
        ProgressItem("Foco", "84%", "+8%"),
        ProgressItem("Sono", "7.4h", "+0.5h"),
        ProgressItem("Estresse", "Moderado", "-12%"),
        ProgressItem("Satisfação", "86%", "+5%")
    )

    fun getStudyGroups(): List<StudyGroup> = listOf(
        StudyGroup("g1", "Banco de Dados", "ADS", 5, "Hoje, 18:30"),
        StudyGroup("g2", "Cálculo II", "Engenharia", 4, "Quarta, 19:00"),
        StudyGroup("g3", "Redes de Computadores", "TI", 6, "Sexta, 17:15")
    )
}
