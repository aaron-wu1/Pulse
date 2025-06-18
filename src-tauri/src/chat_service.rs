use ollama_rs::error::OllamaError;
use ollama_rs::{
    generation::completion::{request::GenerationRequest, GenerationResponse},
    Ollama,
};
use std::error::Error;

pub struct ChatService {
    pub ollama: Ollama,
}

impl ChatService {
    pub async fn new() -> Result<Self, Box<dyn Error + Send + Sync>> {
        let ollama = Ollama::default();
        Ok(Self { ollama })
    }

    pub async fn send_message(&mut self, prompt: &str) -> Result<GenerationResponse, OllamaError> {
        let model = "gemma3:1b-it-qat".to_string();
        let prompt = prompt.to_string();
        let res = self
            .ollama
            .generate(GenerationRequest::new(model, prompt))
            .await;
        return res;
    }
}
