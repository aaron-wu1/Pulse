mod chat_service;
mod process;
mod process_update_controller;
mod sys_mem;

use std::time::Duration;

use crate::process::Process;
use crate::sys_mem::SystemMemoryStats;
use chat_service::ChatService;
use process_update_controller::ProcessUpdateController;
use serde::Serialize;
use std::cell::Cell;
use std::sync::Arc;
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
async fn update_sys_mem_stats(
    state: tauri::State<'_, Arc<Mutex<ProcessUpdateController>>>,
    window: tauri::Window,
) -> Result<(), String> {
    let controller = state.lock().await;
    let mut pause_rx = controller.pause_tx.subscribe();
    let mut rate_rx = controller.rate_tx.subscribe();
    tokio::spawn(async move {
        loop {
            // controller is paused, wait
            let is_paused: bool = *pause_rx.borrow();
            // print!("isPaused {}", is_paused);
            if is_paused {
                pause_rx.changed().await.unwrap();
                continue;
            }
            let sys_mem_stats = match sys_mem::get_system_memory_stats().await {
                // unpacks to match validation type
                Ok(stats) => stats,
                Err(e) => {
                    eprintln!("Error getting system memory stats: {}", e);
                    SystemMemoryStats::default() // Return a default instance if applicable
                }
            };
            let rate: u64 = *rate_rx.borrow();

            window.emit("sys_mem_update", &sys_mem_stats).unwrap();
            tokio::time::sleep(Duration::from_secs(rate)).await;
        }
    });
    Ok(())
}

#[tauri::command]
async fn get_processes() -> Vec<Process> {
    process::get_process_info().await
}

#[tauri::command]
async fn pause_updates(
    state: tauri::State<'_, Arc<Mutex<ProcessUpdateController>>>,
) -> Result<(), String> {
    let controller = state.lock().await;
    controller.pause();
    Ok(())
}

#[tauri::command]
async fn resume_updates(
    state: tauri::State<'_, Arc<Mutex<ProcessUpdateController>>>,
) -> Result<(), String> {
    let controller = state.lock().await;
    controller.resume();
    Ok(())
}

#[tauri::command]
async fn update_process_info(
    state: tauri::State<'_, Arc<Mutex<ProcessUpdateController>>>,
    window: tauri::Window,
) -> Result<(), String> {
    let controller = state.lock().await;
    let mut pause_rx = controller.pause_tx.subscribe();
    let mut rate_rx = controller.rate_tx.subscribe();
    tokio::spawn(async move {
        loop {
            // controller is paused, wait
            let is_paused: bool = *pause_rx.borrow();
            if is_paused {
                pause_rx.changed().await.unwrap();
                continue;
            }
            let process_info = process::get_process_info().await;
            let rate = *rate_rx.borrow();
            window.emit("process_update", &process_info).unwrap();
            tokio::time::sleep(Duration::from_secs(rate)).await;
        }
    });
    Ok(())
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

#[tauri::command]
async fn get_process_info(
    state: tauri::State<'_, Mutex<ChatService>>,
    prompt: String,
) -> Result<String, ()> {
    println!("BACKEND received: {}", prompt);
    let encap_prompt = format!(
        r#"[System]
    You are an expert on macOS system processes. For each of the following process names, provide a brief explanation (1–3 sentences max). If the function is unknown or unclear, say "Unknown."
    
    [User]
    {}
    
    [Assistant]
    "#,
        prompt
    );

    let mut chat = state.lock().await;
    let res = chat
        .send_message(&encap_prompt)
        .await
        .map_err(|e| e.to_string())
        .unwrap();
    println!("BACKEND send: {}", res.response);
    let response = res.response;
    Ok(response)
}

#[tauri::command]
async fn get_dumb_process_info(
    state: tauri::State<'_, Mutex<ChatService>>,
    prompt: String,
) -> Result<String, ()> {
    println!("BACKEND received: {}", prompt);
    let encap_prompt = format!(
        r#"[System]
    You are an expert on macOS system processes. For each of the following process names, provide a brief explanation (1–3 sentences max). If the function is unknown or unclear, say "Unknown.". You have to explain it to the user like if they were five years old.
    
    [User]
    {}
    
    [Assistant]
    "#,
        prompt
    );

    let mut chat = state.lock().await;
    let res = chat
        .send_message(&encap_prompt)
        .await
        .map_err(|e| e.to_string())
        .unwrap();
    println!("BACKEND send: {}", res.response);
    let response = res.response;
    Ok(response)
}

#[tauri::command]
async fn update_rate(
    new_rate: u64,
    state: tauri::State<'_, Arc<Mutex<ProcessUpdateController>>>,
) -> Result<(), String> {
    let controller = state.lock().await;
    controller.set_rate(new_rate);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let chat_service = ChatService::new()
        .await
        .expect("Failed to initialize ChatService");
    let (pause_tx, _pause_rx) = tokio::sync::watch::channel(false);
    let (rate_tx, _rate_tx) = tokio::sync::watch::channel(2u64);
    let controller = ProcessUpdateController { pause_tx, rate_tx };
    let shared_controller = Arc::new(Mutex::new(controller));
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(tokio::sync::Mutex::new(chat_service)) // add chat service to tauri state
        .manage(shared_controller)
        .invoke_handler(tauri::generate_handler![
            greet,
            get_stats,
            get_processes,
            kill_process,
            send_chat_message,
            get_process_info,
            get_dumb_process_info,
            update_process_info,
            resume_updates,
            pause_updates,
            update_sys_mem_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
