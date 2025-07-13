use ollama_rs::error::OllamaError;
use ollama_rs::{
    generation::completion::{request::GenerationRequest, GenerationResponse},
    Ollama,
};
use std::error::Error;

pub struct ChatService {
    pub ollama: Ollama,
    pub model: String,
}

impl ChatService {
    pub async fn new() -> Result<Self, Box<dyn Error + Send + Sync>> {
        let ollama = Ollama::default();
        let model = "gemma3n:e4b-it-q4_K_M".to_string();
        Ok(Self { ollama, model })
    }

    pub async fn send_message(&mut self, prompt: &str) -> Result<GenerationResponse, OllamaError> {
        let prompt = prompt.to_string();
        let res = self
            .ollama
            .generate(GenerationRequest::new(self.model.clone(), prompt))
            .await;
        return res;
    }
}
