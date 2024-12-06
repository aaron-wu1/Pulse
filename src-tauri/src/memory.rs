struct MemoryStats {
    allocations: HashMap<*mut libc::c_void, usize>, //map of address to size
    peak_usage: usize,
    current_usage: usize,
}
