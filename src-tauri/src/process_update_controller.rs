use tokio::sync::watch;

pub struct ProcessUpdateController {
    pub pause_tx: watch::Sender<bool>,
    pub rate_tx: watch::Sender<u64>,
}

impl ProcessUpdateController {
    pub fn pause(&self) {
        let _ = self.pause_tx.send(true);
    }

    pub fn resume(&self) {
        let _ = self.pause_tx.send(false);
    }

    pub fn set_rate(&self, new_rate: u64) {
        let _ = self.rate_tx.send(new_rate);
    }
}
