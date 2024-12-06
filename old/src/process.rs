use libc::{mach_task_self, pid_t, task_for_pid, task_t};
pub struct ProcessTask {
    task: task_t,
}

impl ProcessTask {
    // attempt to attach process with pid
    pub fn attach_to_process(pid: pid_t) -> io::Result<Self> {
        let mut task = 0;

        // call the unsafe task for pid
        let result = unsafe { task_for_pid(mach_task_self(), pid, &mut task) };

        if result == 0 {
            println!("Attached to process with taskID: {}", task);
        } else {
            eprintln!("Failed to attach to process: {}", result)
        }
    }

    pub fn task_port(&self) -> task_t {
        self.task
    }
}
