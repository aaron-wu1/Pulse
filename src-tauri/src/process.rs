use serde::{Deserialize, Serialize};
use sysinfo::{ProcessRefreshKind, ProcessStatus, RefreshKind, System, Users};
use tokio::task;

#[derive(Default)] // sets default for struct
#[derive(Serialize, Deserialize)] // serialize for tauri
pub struct Process {
    pub pid: u32,
    pub name: String,
    pub memory: u64,
    pub user: String,
    pub status: String,
    pub responsive: bool,
}

pub async fn get_process_info() -> Vec<Process> {
    let processes = task::spawn_blocking(|| {
        // Use spawn_blocking to offload the blocking operation to another thread
        let mut processes: Vec<Process> = Vec::new();
        let mut sys = System::new_all();
        // // refresh with only process info
        // sys.refresh_specifics(
        //     RefreshKind::nothing().with_processes(ProcessRefreshKind::everything()),
        // );
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

            processes.push(Process {
                pid: process.pid().as_u32(),
                name: process.name().to_str().unwrap_or("").to_string(),
                memory: process.memory(),
                user: user,
                status: parse_status(process.status()),
                responsive: true,
            });
            // println!("[{pid}] {:?} {:?}", process.name(), process.disk_usage());
        }
        // let mut processes: Vec<Process> = Vec::new();
        // // take snapshop of top command
        // let output = Command::new("top")
        //     .arg("-l 1")
        //     .output()
        //     .expect("Failed to execute top");
        // let output_str = String::from_utf8_lossy(&output.stdout);

        // // parse process from top, skip metadata
        // for line in output_str.lines().skip(12) {
        //     let parts: Vec<&str> = line.split_whitespace().collect();
        //     processes.push(parse_line_parts(parts));
        // }
        processes
    })
    .await
    .unwrap();
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

// fn check_process_responsive(process: Process) -> bool {
//     let cpu_usage = process.cpu_usage();
//     return cpu_usage > 0.0;
// }

// fn check_process_responsive(pid: i32) -> Option<bool> {
//     if let Ok(info) = pidinfo::<TaskInfo>(pid, 0) {
//         // Check task info; e.g., suspended processes are unresponsive
//         Some(info.suspend_count == 0)
//     } else {
//         None // Could not retrieve process info
//     }
// }

// use std::os::raw::{c_int, c_uint};

// extern "C" {
//     fn task_for_pid(target_tport: c_uint, pid: c_int, task: *mut c_uint) -> c_int;
//     fn mach_task_self() -> c_uint;
// }

// const KERN_SUCCESS: c_int = 0;
// const KERN_INVALID_ARGUMENT: i32 = 4;
// const KERN_PROTECTION_FAILURE: i32 = 10;

// fn check_process_responsive(pid: i32) -> bool {
//     let mut task: c_uint = 0;
//     println!("pid: {:?}", pid);
//     let result = unsafe { task_for_pid(mach_task_self(), pid, &mut task) };
//     match result {
//         KERN_SUCCESS => println!("Successfully got task port."),
//         KERN_INVALID_ARGUMENT => println!("Invalid argument: Process doesn't exist."),
//         KERN_PROTECTION_FAILURE => println!("Permission denied."),
//         _ => println!("Unknown error: {}", result),
//     }
//     println!("result: {:?}", result == KERN_SUCCESS);
//     result == KERN_SUCCESS
// }

// fn parse_memory_line(line: &str) -> f64 {
//     println!("line: {:?}", line);
//     // let measurement: Vec<&str> = line.split(|c: char| !c.is_numeric()).collect();
//     // println!("measurement: {:?}", measurement);
//     let value = &line[0..line.len() - 1];
//     let unit = &line[line.len() - 1..line.len()];
//     println!("val: {:?}, unit: {:?}", value, unit);
//     let parsed_value = value.parse::<f64>().unwrap_or(0.0);
//     match unit {
//         "K" => parsed_value,
//         "M" => parsed_value * 1024.0,
//         "G" => parsed_value * 1024.0 * 1024.0,
//         _ => 0.0,
//     }
// }
