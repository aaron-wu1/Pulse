use libc::{c_void, size_t, sysctlbyname};
use serde::{Deserialize, Serialize};
use std::ffi::CString;
use std::io;
// use std::mem; // memusage
// use std::ptr; // pointers

use std::process::Command;
use std::str::FromStr;

// memory stats for system
#[derive(Default)] // sets default for struct
#[derive(Serialize, Deserialize)] // serialize for tauri
pub struct SystemMemoryStats {
    pub free: u64,
    pub active: u64,
    pub inactive: u64,
    pub wired: f64,
    pub memsize: f64,
}
#[derive(Default)] // sets default for struct
#[derive(Debug)]
struct VmStats {
    free: f64,
    active: f64,
    inactive: f64,
    wired: f64,
    size: f32,
    purgeable: f64,
}

const PAGE_SIZE_KB: u64 = 16; // page = 16kb for arm

fn bytes_to_gbs(bytes: u64) -> f64 {
    return bytes as f64 / (1024.0 * 1024.0 * 1024.0);
}

fn pages_to_gbs(pages: u64) -> f64 {
    return (pages * PAGE_SIZE_KB) as f64 / (1024.0 * 1024.0);
}

fn parse_vm_stat_output(output: &str) -> VmStats {
    let mut vm_stats = VmStats::default();
    for line in output.lines() {
        let parsed_line = parse_line(line);
        match parsed_line {
            Some((key, value)) => match key.as_str() {
                "Pages free" => vm_stats.free = pages_to_gbs(value),
                "Pages active" => vm_stats.active = pages_to_gbs(value),
                "Pages wired down" => vm_stats.wired = pages_to_gbs(value),
                "Page purgeable" => vm_stats.purgeable = pages_to_gbs(value),
                _ => {}
            },
            None => {}
        }
    }
    vm_stats
}

fn parse_line(line: &str) -> Option<(String, u64)> {
    // init vector that splits output by ':'
    let parts: Vec<&str> = line.split(":").collect();
    // if k,v pair
    if parts.len() == 2 {
        // removes whitespace
        let key = parts[0].trim().to_string();
        // trim period
        let val_str = parts[1].trim().replace(".", "");
        println!(
            "pt1| key: {}, value: {}",
            key,
            parts[1].trim().replace(".", "")
        );
        let mut value = 0;
        // check for non-int types
        match val_str.parse::<u64>() {
            Ok(val) => value = val,
            Err(e) => println!("value failed to parse as int"),
        }
        println!("pt2| key: {}, value: {}", key, value);
        // let value = parts[1]
        //     .trim()
        //     .replace(".", "")
        //     .to_string()
        //     .parse::<u64>()
        //     .unwrap();
        return Some((key, value));
    }
    // if invalid
    None
}

pub fn get_system_memory_stats() -> io::Result<SystemMemoryStats> {
    let mut free: u64 = 0;
    let mut active: u64 = 0;
    let mut inactive: u64 = 0;
    let mut wired: u64 = 0;
    let mut memsize: u64 = 0;

    let mut size = std::mem::size_of::<u64> as size_t;
    let mut size1 = std::mem::size_of::<f64> as size_t;
    // Convert Rust string to a C string
    let free_key = CString::new("vm.page_free_count").unwrap();
    let memsize_key = CString::new("hw.memsize").unwrap();
    let page_pageable_internal_count = CString::new("hw.memsize").unwrap();
    // let active_key = CString::new("vm.page_active_count").unwrap();
    // let inactive_key = CString::new("vm.page_inactive_count").unwrap();
    // let wired_key = CString::new("vm.page_wire_count").unwrap();
    let mut vm_stats = VmStats::default();
    unsafe {
        if sysctlbyname(
            free_key.as_ptr(),
            &mut free as *mut u64 as *mut c_void,
            &mut size,
            std::ptr::null_mut(),
            0,
        ) != 0
        {
            return Err(io::Error::last_os_error());
        }
        if sysctlbyname(
            memsize_key.as_ptr(),
            &mut memsize as *mut u64 as *mut c_void,
            &mut size1,
            std::ptr::null_mut(),
            0,
        ) != 0
        {
            return Err(io::Error::last_os_error());
        }

        // call vm stats
        // run vm_stats command
        let output = Command::new("vm_stat")
            .output()
            .expect("Failed to execute vm_stat");
        // parse to a string
        let output_str = String::from_utf8_lossy(&output.stdout); // returns a Cow (smart pointer providing clone-on-write fn)
                                                                  //
        vm_stats = parse_vm_stat_output(&output_str);
        println!("vm_stats, {:#?}", vm_stats);
        // // Query vm.stats using sysctlbyname
        // if sysctlbyname(
        //     "vm.stats".as_ptr() as *const i8,
        //     &mut stats as *mut VmStats as *mut c_void,
        //     &mut mem::size_of::<VmStats>() as *mut usize,
        //     ptr::null_mut(),
        //     0,
        // ) != 0
        // {
        //     return Err(io::Error::last_os_error());
        // }

        // if sysctlbyname(
        //     active_key.as_ptr(),
        //     &mut active as *mut u64 as *mut c_void,
        //     &mut size,
        //     std::ptr::null_mut(),
        //     0,
        // ) != 0
        // {
        //     return Err(io::Error::last_os_error());
        // }
        // if sysctlbyname(
        //     inactive_key.as_ptr(),
        //     &mut inactive as *mut u64 as *mut c_void,
        //     &mut size,
        //     std::ptr::null_mut(),
        //     0,
        // ) != 0
        // {
        //     return Err(io::Error::last_os_error());
        // }
        // if sysctlbyname(
        //     wired_key.as_ptr(),
        //     &mut wired as *mut u64 as *mut c_void,
        //     &mut size,
        //     std::ptr::null_mut(),
        //     0,
        // ) != 0
        // {
        //     return Err(io::Error::last_os_error());
        // }
    }
    // mac page size: 16384 bytes
    // Ok(SystemMemoryStats {
    //     free: bytes_to_gb(free * 16384),
    //     active: active * 4096,
    //     inactive: inactive * 4096,
    //     wired: wired * 4096,
    //     memsize: bytes_to_gb(memsize as u64 * 16384) as f64,
    // })
    println!("memsize {}", memsize);
    println!("wired {}", vm_stats.wired);
    Ok(SystemMemoryStats {
        free: free * 16384,
        active: active * 4096,
        inactive: inactive * 4096,
        wired: vm_stats.wired,
        memsize: memsize as f64 / (1024.0 * 1024.0 * 1024.0), // memsize: memsize * 16384,
    })
}

// fn main() -> io::Result<()> {
//     let stats = get_system_memory_stats()?;

// }
