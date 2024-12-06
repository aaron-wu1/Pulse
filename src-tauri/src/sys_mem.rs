use libc::{c_void, size_t, sysctlbyname};
use serde::{Deserialize, Serialize};
use std::ffi::CString;
use std::io;

// memory stats for system
#[derive(Default)] // sets default for struct
#[derive(Serialize, Deserialize)] // serialize for tauri
pub struct SystemMemoryStats {
    pub free: u64,
    pub active: u64,
    pub inactive: u64,
    pub wired: u64,
    pub memsize: f64,
}

fn bytes_to_gb(bytes: u64) -> u64 {
    return (bytes as f64 / 1_073_741_824.0) as u64;
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
    // let active_key = CString::new("vm.page_active_count").unwrap();
    // let inactive_key = CString::new("vm.page_inactive_count").unwrap();
    // let wired_key = CString::new("vm.page_wire_count").unwrap();

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

    Ok(SystemMemoryStats {
        free: free * 16384,
        active: active * 4096,
        inactive: inactive * 4096,
        wired: wired * 4096,
        memsize: memsize as f64 / (1024.0 * 1024.0 * 1024.0), // memsize: memsize * 16384,
    })
}

// fn main() -> io::Result<()> {
//     let stats = get_system_memory_stats()?;

// }
