use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use sysinfo::{ProcessRefreshKind, ProcessStatus, ProcessesToUpdate, System, Users};

#[derive(Default)] // sets default for struct
#[derive(Serialize, Deserialize, Clone)] // serialize for tauri
pub struct Process {
    pub pid: u32,
    pub name: String,
    pub memory: u64,
    pub user: String,
    pub status: String,
    pub responsive: bool,
}

static PREVIOUS_SNAPSHOT: OnceCell<Arc<Mutex<HashMap<u32, Process>>>> = OnceCell::new();
// 1024 bytes
const MEM_THRESHOLD: u64 = 1024;

fn get_snapshot_store() -> Arc<Mutex<HashMap<u32, Process>>> {
    PREVIOUS_SNAPSHOT
        .get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
        .clone()
}

fn memory_diff_exceeds_threshold(a: u64, b: u64, threshold: u64) -> bool {
    let diff = if a > b { a - b } else { b - a };
    diff >= threshold
}

fn diff_process(prev_process: &Process, curr_process: &Process) -> bool {
    return prev_process.name != curr_process.name
        || prev_process.status != curr_process.status
        || prev_process.user != curr_process.user
        || prev_process.responsive != curr_process.responsive
        || memory_diff_exceeds_threshold(prev_process.memory, curr_process.memory, MEM_THRESHOLD);
}

pub async fn get_process_info() -> Vec<Process> {
    // let processes = task::(|| {
    // Use spawn_blocking to offload the blocking operation to another thread
    let snapshot = get_snapshot_store();
    let mut prev_snapshot_guard: std::sync::MutexGuard<'_, HashMap<u32, Process>> =
        snapshot.lock().unwrap();
    let prev_snapshot = prev_snapshot_guard.clone();

    let mut curr_snapshot = HashMap::new();

    // let mut sys = System::new_all();
    // // refresh with only process info
    // sys.refresh_specifics(
    //     RefreshKind::nothing().with_processes(ProcessRefreshKind::everything()),
    // );

    let mut sys = System::new();

    // We don't want to update the CPU information.
    sys.refresh_processes_specifics(
        ProcessesToUpdate::All,
        true,
        ProcessRefreshKind::everything()
            .without_cpu()
            .without_disk_usage()
            .without_exe()
            .without_cwd(),
    );

    let users = Users::new_with_refreshed_list();

    // First we update all information of our `System` struct.
    sys.refresh_all();
    for (_, process) in sys.processes() {
        let user = match process.user_id() {
            Some(id) => match users.get_user_by_id(id) {
                Some(user) => user.name().to_string(),
                None => "".to_string(),
            },
            None => "".to_string(),
        };

        let curr_process = Process {
            pid: process.pid().as_u32(),
            name: process.name().to_str().unwrap_or("").to_string(),
            memory: process.memory(),
            user,
            status: parse_status(process.status()),
            responsive: true,
        };

        match prev_snapshot.get(&curr_process.pid) {
            Some(prev_process) if !diff_process(&prev_process, &curr_process) => {
                continue;
            }
            _ => {
                curr_snapshot.insert(process.pid().as_u32(), curr_process.clone());
            }
        }
    }
    // let mut processes: Vec<Process> = Vec::new();
    let mut processes: Vec<Process> = curr_snapshot.values().cloned().collect();
    // Sort processes
    processes.sort_by_key(|p| p.pid);
    // update snapshot
    *prev_snapshot_guard = curr_snapshot;
    println!("Number of processes: {}", processes.len());
    processes
}

fn parse_status(status: ProcessStatus) -> String {
    match status {
        ProcessStatus::Idle => "Idle".to_string(),
        ProcessStatus::Run => "Running".to_string(),
        ProcessStatus::Sleep => "Sleeping".to_string(),
        ProcessStatus::Stop => "Stopped".to_string(),
        ProcessStatus::Zombie => "Zombie".to_string(),
        ProcessStatus::Parked => "Parked".to_string(),
        ProcessStatus::Unknown(_) => "Unknown".to_string(),
        _ => "".to_string(),
    }
}
