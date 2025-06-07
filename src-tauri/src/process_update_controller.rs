use tokio::sync::watch;

pub struct ProcessUpdateController {
    pub pause_tx: watch::Sender<bool>,
}

impl ProcessUpdateController {
    pub fn pause(&self) {
        let _ = self.pause_tx.send(true);
    }

    pub fn resume(&self) {
        let _ = self.pause_tx.send(false);
    }

    // pub fn setRate(&self, new_rate: uint32) {
    //     self.rate = new_rate;
    // }
}
