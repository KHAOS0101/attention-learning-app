package com.attentionlearning.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.attentionlearning.ui.screens.DashboardScreen
import com.attentionlearning.ui.screens.DiaryScreen
import com.attentionlearning.ui.screens.HomeScreen
import com.attentionlearning.ui.screens.LoginScreen
import com.attentionlearning.ui.screens.MemoryScreen
import com.attentionlearning.ui.screens.PomodoroScreen
import com.attentionlearning.ui.screens.ProfileScreen
import com.attentionlearning.ui.screens.SocialScreen
import com.attentionlearning.ui.screens.WellnessScreen

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    data object Login : Screen("login", "Login", Icons.Filled.Person)
    data object Home : Screen("home", "Home", Icons.Filled.Home)
    data object Pomodoro : Screen("pomodoro", "Pomodoro", Icons.Filled.Timer)
    data object Diary : Screen("diary", "Diário", Icons.Filled.EditNote)
    data object Wellness : Screen("wellness", "Bem-estar", Icons.Filled.MonitorHeart)
    data object Memory : Screen("memory", "Memória", Icons.Filled.Lightbulb)
    data object Social : Screen("social", "Social", Icons.Filled.People)
    data object Dashboard : Screen("dashboard", "Evolução", Icons.Filled.BarChart)
    data object Profile : Screen("profile", "Perfil", Icons.Filled.Person)
}

@Composable
fun AttentionLearningNavHost() {
    val navController = rememberNavController()
    val bottomItems = listOf(
        Screen.Home,
        Screen.Pomodoro,
        Screen.Diary,
        Screen.Wellness,
        Screen.Memory,
        Screen.Social,
        Screen.Dashboard,
        Screen.Profile
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route
                bottomItems.forEach { item ->
                    NavigationBarItem(
                        selected = currentRoute == item.route,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Login.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Login.route) {
                LoginScreen(navController)
            }
            composable(Screen.Home.route) {
                HomeScreen(navController)
            }
            composable(Screen.Pomodoro.route) {
                PomodoroScreen(navController)
            }
            composable(Screen.Diary.route) {
                DiaryScreen(navController)
            }
            composable(Screen.Wellness.route) {
                WellnessScreen(navController)
            }
            composable(Screen.Memory.route) {
                MemoryScreen(navController)
            }
            composable(Screen.Social.route) {
                SocialScreen(navController)
            }
            composable(Screen.Dashboard.route) {
                DashboardScreen(navController)
            }
            composable(Screen.Profile.route) {
                ProfileScreen(navController)
            }
        }
    }
}
