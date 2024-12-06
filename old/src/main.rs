use libc::{mach_task_self, pid_t, task_for_pid, task_t};
use serde_json::json;
use std::{collections::HashMap, io};

// mod process;
mod sys_mem;
fn main() -> io::Result<()> {
    println!("Getting system memory stats");
    let stats = sys_mem::get_system_memory_stats()?;
    println!("System Memory Stats:");
    println!("Free: {} bytes", stats.free);
    println!("Active: {} bytes", stats.active);
    println!("Inactive: {} bytes", stats.inactive);
    println!("Wired: {} bytes", stats.wired);
    println!("Total: {} bytes", stats.memsize);
    Ok(())
    // println!("staring program!");
    // let mut vec = Vec::new();
    // for i in 0..10 {
    //     vec.push(vec![i; 1024 * 1024]); // Allocate 1MB chunks
    //     println!("Allocated {} MB", (i + 1));
    //     std::thread::sleep(std::time::Duration::from_secs(1)); // Pause to simulate activity
    // }
    // println!("Finished allocations");
    // std::thread::sleep(std::time::Duration::from_secs(60)); // Keep the process alive
}

// impl Drop for ProcessTask {
//     fn dro
// }

// hook
extern "C" fn my_malloc(size: usize) -> *mut libc::c_void {
    println!("Allocating memory: {} bytes", size);
    unsafe {
        libc::malloc(size) // call malloc
    }
}

// log to JSON
// fn log_allocation(size: usize, address: *mut libc::c_void) {
//     // create entry
//     let log_entry = json!({
//         "size": size,
//         "address": format!("{:?}", address),
//         "timestamp": chrono::Utc::now(),
//     })
//     println!("{}", log_entry); // save to file
// }
