mod process;
mod sys_mem;

use crate::process::Process;
use crate::sys_mem::SystemMemoryStats;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_stats() -> SystemMemoryStats {
    match sys_mem::get_system_memory_stats() {
        // unpacks to match validation type
        Ok(stats) => stats,
        Err(e) => {
            eprintln!("Error getting system memory stats: {}", e);
            SystemMemoryStats::default() // Return a default instance if applicable
        }
    }
}

#[tauri::command]
async fn get_processes() -> Vec<Process> {
    process::get_process_info().await
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, get_stats, get_processes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
