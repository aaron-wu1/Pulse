use libc::{c_void, size_t, sysctlbyname};
use serde::{Deserialize, Serialize};
use std::ffi::CString;
use std::io;
// use std::mem; // memusage
// use std::ptr; // pointers

use std::process::Command;

// memory stats for system
#[derive(Default)] // sets default for struct
#[derive(Serialize, Deserialize)] // serialize for tauri
pub struct SystemMemoryStats {
    pub free: u64,
    pub active: f64,
    pub inactive: f64,
    pub app: f64,
    pub wired: f64,
    pub compressed: f64,
    pub memsize: f64,
}
#[derive(Default)] // sets default for struct
#[derive(Debug)]
struct VmStats {
    free: f64,
    active: f64,
    inactive: f64,
    wired: f64,
    purgeable: f64,
    compressed: f64,
    pages_speculative: f64,
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
                "Pages inactive" => vm_stats.inactive = pages_to_gbs(value),
                "Pages wired down" => vm_stats.wired = pages_to_gbs(value),
                "Page purgeable" => vm_stats.purgeable = pages_to_gbs(value),
                "Pages speculative" => vm_stats.pages_speculative = pages_to_gbs(value),
                // "Pages stored in compressor" => vm_stats.compressed = pages_to_gbs(value),
                "Pages occupied by compressor" => vm_stats.compressed = pages_to_gbs(value),
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
        let mut value = 0;
        // check for non-int types
        match val_str.parse::<u64>() {
            Ok(val) => value = val,
            Err(e) => println!("value failed to parse as int"),
        }
        return Some((key, value));
    }
    // if invalid
    None
}

pub fn get_system_memory_stats() -> io::Result<SystemMemoryStats> {
    let mut free: u64 = 0;
    let mut memsize: u64 = 0;
    let mut page_pageable_internal_count_size: u64 = 0;
    let mut size = std::mem::size_of::<u64> as size_t;
    let mut size1 = std::mem::size_of::<f64> as size_t;
    // Convert Rust string to a C string
    let free_key = CString::new("vm.page_free_count").unwrap();
    let memsize_key = CString::new("hw.memsize").unwrap();
    let page_pageable_internal_count = CString::new("vm.page_pageable_internal_count").unwrap();
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
        if sysctlbyname(
            page_pageable_internal_count.as_ptr(),
            &mut page_pageable_internal_count_size as *mut u64 as *mut c_void,
            &mut size1,
            std::ptr::null_mut(),
            0,
        ) != 0
        {
            return Err(io::Error::last_os_error());
        }
    }

    // call vm stats
    // run vm_stats command
    let output = Command::new("vm_stat")
        .output()
        .expect("Failed to execute vm_stat");
    // parse to a string
    let output_str = String::from_utf8_lossy(&output.stdout); // returns a Cow (smart pointer providing clone-on-write fn)

    let vm_stats = parse_vm_stat_output(&output_str);
    println!("memsize {}", memsize);
    println!("wired {}", vm_stats.wired);
    println!("wired {}", vm_stats.compressed);
    println!(
        "page_pageable_internal_count_size {}",
        page_pageable_internal_count_size
    );
    Ok(SystemMemoryStats {
        free: free * 16384,
        active: vm_stats.active,
        inactive: vm_stats.inactive,
        app: pages_to_gbs(page_pageable_internal_count_size) - vm_stats.purgeable,
        wired: vm_stats.wired,
        compressed: vm_stats.compressed,
        memsize: memsize as f64 / (1024.0 * 1024.0 * 1024.0), // memsize: memsize * 16384,
    })
}
