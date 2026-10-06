package com.attentionlearning.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.attentionlearning.data.repository.AppRepository
import com.attentionlearning.ui.navigation.Screen

@Composable
fun LoginScreen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Attention Learning",
            style = MaterialTheme.typography.headlineLarge
        )
        Text(
            text = "Acompanhe foco, hábitos, estudos e comunidade.",
            modifier = Modifier.padding(top = 12.dp, bottom = 24.dp)
        )
        Button(
            onClick = { navController.navigate(Screen.Home.route) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Entrar")
        }
    }
}

@Composable
fun HomeScreen(navController: NavController) {
    val repository = AppRepository()
    val profile = repository.getStudentProfile()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("Olá, ${profile.name}", style = MaterialTheme.typography.headlineMedium)
            Text("Campus: ${profile.campus}", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Resumo do dia")
                    Text("Foco: 84%")
                    Text("Sono: 7.4h")
                    Text("Estresse: moderado")
                }
            }
        }

        item {
            Text("Hobbies", style = MaterialTheme.typography.titleLarge)
            Text(profile.hobbies.joinToString(" • "))
        }
    }
}

@Composable
fun PomodoroScreen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("Pomodoro", style = MaterialTheme.typography.headlineMedium)
        Text("25:00", style = MaterialTheme.typography.displayLarge)
        Button(onClick = { }) {
            Text("Iniciar sessão")
        }
    }
}

@Composable
fun DiaryScreen(navController: NavController) {
    val logs = AppRepository().getDailyLogs()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Text("Registro diário", style = MaterialTheme.typography.headlineMedium) }
        logs.forEach { log ->
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(log.title, style = MaterialTheme.typography.titleMedium)
                        Text(log.date)
                        Text(log.note)
                        Text("Foco: ${log.focusScore}% • Humor: ${log.mood}")
                    }
                }
            }
        }
    }
}

@Composable
fun WellnessScreen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Bem-estar", style = MaterialTheme.typography.headlineMedium)
        Text("Sono: 7h40min")
        Text("Foco: 84%")
        Text("Estresse: moderado")
        Text("Telas: 2h30min de uso consciente")
    }
}

@Composable
fun MemoryScreen(navController: NavController) {
    val exercises = AppRepository().getMemoryExercises()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Text("Estratégias de memória", style = MaterialTheme.typography.headlineMedium) }
        exercises.forEach { exercise ->
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(exercise.title, style = MaterialTheme.typography.titleMedium)
                        Text(exercise.difficulty)
                        Text(exercise.description)
                    }
                }
            }
        }
    }
}

@Composable
fun SocialScreen(navController: NavController) {
    val groups = AppRepository().getStudyGroups()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Text("Conexão com estudantes", style = MaterialTheme.typography.headlineMedium) }
        groups.forEach { group ->
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(group.name, style = MaterialTheme.typography.titleMedium)
                        Text("Disciplina: ${group.subject}")
                        Text("Membros: ${group.members}")
                        Text("Próxima aula: ${group.nextMeeting}")
                    }
                }
            }
        }
    }
}

@Composable
fun DashboardScreen(navController: NavController) {
    val progress = AppRepository().getProgressItems()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Text("Painel de evolução", style = MaterialTheme.typography.headlineMedium) }
        progress.forEach { item ->
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(item.label)
                        Text(item.value, style = MaterialTheme.typography.titleLarge)
                        Text(item.change)
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(navController: NavController) {
    val profile = AppRepository().getStudentProfile()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Perfil", style = MaterialTheme.typography.headlineMedium)
        Text(profile.name)
        Text("Campus: ${profile.campus}")
        Text("Estilo de estudo: ${profile.studyStyle}")
        Text("Hobbies: ${profile.hobbies.joinToString(", ")}")
    }
}
