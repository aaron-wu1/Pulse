use serde::{Deserialize, Serialize};
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

pub async fn get_process_info() -> Vec<Process> {
    let mut processes: Vec<Process> = Vec::new();

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
        processes.push(curr_process.clone());
    }
    // Sort processes
    processes.sort_by_key(|p| p.pid);
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
