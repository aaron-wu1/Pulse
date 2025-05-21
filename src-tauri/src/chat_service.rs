use kalosm::language::*;
use ollama_rs::error::OllamaError;
use ollama_rs::{
    generation::completion::{request::GenerationRequest, GenerationResponse},
    Ollama,
};
use std::error::Error;

pub struct ChatService {
    // pub chat: Chat<Llama>,
    pub ollama: Ollama,
}

impl ChatService {
    pub async fn new() -> Result<Self, Box<dyn Error + Send + Sync>> {
        // let model = Llama::phi_3().await?;
        // let chat = model
        //     .chat()
        //     .with_system_prompt("You are a pirate called Blackbeard");
        // By default, it will connect to localhost:11434
        let ollama = Ollama::default();
        Ok(Self { ollama })
    }

    pub async fn send_message(&mut self, prompt: &str) -> Result<GenerationResponse, OllamaError> {
        // let response = (self.chat)(prompt).await?;
        // Ok(response)

        let model = "gemma3:1b-it-qat".to_string();
        // let prompt = "Why is the sky blue?".to_string();
        let prompt = prompt.to_string();
        let res = self
            .ollama
            .generate(GenerationRequest::new(model, prompt))
            .await;

        return res;
    }
}
