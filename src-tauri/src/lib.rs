mod chat_service;
mod process;
mod sys_mem;

use crate::process::Process;
use crate::sys_mem::SystemMemoryStats;
use chat_service::ChatService;
use serde::Serialize;
use sysinfo::{Pid, System};
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[derive(Serialize, Clone)]
struct ProcessKilledInfo {
    pid: u32,
    name: String,
    success: bool,
}
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_stats() -> SystemMemoryStats {
    match sys_mem::get_system_memory_stats().await {
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

#[tauri::command]
fn kill_process(app: AppHandle, pid: u32) {
    let s = System::new_all();
    if let Some(process) = s.process(Pid::from_u32(pid)) {
        process.kill();
        app.emit(
            "process-killed",
            ProcessKilledInfo {
                pid: pid,
                name: process.name().to_str().unwrap_or("").to_string(),
                success: true,
            },
        )
        .unwrap()
    } else {
        app.emit(
            "process-killed",
            ProcessKilledInfo {
                pid: pid,
                name: "".to_string(),
                success: false,
            },
        )
        .unwrap()
    }
}

#[tauri::command]
async fn send_chat_message(
    state: tauri::State<'_, Mutex<ChatService>>,
    prompt: String,
) -> Result<String, ()> {
    println!("BACKEND received: {}", prompt);
    let mut chat = state.lock().await;
    let res = chat
        .send_message(&prompt)
        .await
        .map_err(|e| e.to_string())
        .unwrap();
    println!("BACKEND send: {}", res.response);
    let response = res.response;
    Ok(response)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let chat_service = ChatService::new()
        .await
        .expect("Failed to initialize ChatService");
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(tokio::sync::Mutex::new(chat_service)) // add chat service to tauri state
        .invoke_handler(tauri::generate_handler![
            greet,
            get_stats,
            get_processes,
            kill_process,
            send_chat_message
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
