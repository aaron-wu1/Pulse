use serde::{Deserialize, Serialize};
use std::process::Command;
use sysinfo::{Components, Disks, Networks, System};
use tokio::task;

#[derive(Default)] // sets default for struct
#[derive(Serialize, Deserialize)] // serialize for tauri
pub struct Process {
    pub pid: u32,
    pub name: String,
    pub memory: u64,
    pub user: String,
    pub responsive: bool,
}

pub async fn get_process_info() -> Vec<Process> {
    let processes = task::spawn_blocking(|| {
        // Use spawn_blocking to offload the blocking operation to another thread
        let mut processes: Vec<Process> = Vec::new();
        let mut sys = System::new_all();

        // First we update all information of our `System` struct.
        sys.refresh_all();
        for (pid, process) in sys.processes() {
            processes.push(Process {
                pid: process.pid().as_u32(),
                name: process.name().to_str().unwrap_or("").to_string(),
                memory: process.memory(),
                user: "root".to_string(),
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

// fn parse_line_parts(parts: Vec<&str>) -> Process {
//     let mut index: usize = 1;
//     let mut name = String::from("");
//     for i in 1..parts.len() {
//         if parts[i].parse::<f64>().is_ok() {
//             index = i;
//             break;
//         }
//         name.push_str(parts[i]);
//         name.push(' ');
//     }
//     Process {
//         pid: parts[0].parse::<u64>().unwrap_or(0),
//         name: name.trim().to_string(),
//         memory: parse_memory_line(parts[index + 5]),
//         user: parts[index + 28].to_string(),
//         responsive: true,
//     }
// }
/// Parses a memory line from the `top` command output and converts it to a standardized format.
///
/// # Arguments
///
/// * `line` - A string slice that holds the memory information from the `top` command output.
///
/// # Returns
///
/// A `f64` representing the memory value in KB.
///
/// # Example
///
/// ```
/// let memory_line = "1234K";
/// let parsed_memory = parse_memory_line(memory_line);
/// assert_eq!(parsed_memory, "1234");
/// ```
fn parse_memory_line(line: &str) -> f64 {
    println!("line: {:?}", line);
    // let measurement: Vec<&str> = line.split(|c: char| !c.is_numeric()).collect();
    // println!("measurement: {:?}", measurement);
    let value = &line[0..line.len() - 1];
    let unit = &line[line.len() - 1..line.len()];
    println!("val: {:?}, unit: {:?}", value, unit);
    let parsed_value = value.parse::<f64>().unwrap_or(0.0);
    match unit {
        "K" => parsed_value,
        "M" => parsed_value * 1024.0,
        "G" => parsed_value * 1024.0 * 1024.0,
        _ => 0.0,
    }
}
