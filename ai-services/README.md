# AI Services

This directory contains standalone AI/ML microservices for the RailMadad platform.

## Structure

```
ai-services/
├── classification/     # BERT/DistilBERT complaint classification
├── sentiment/          # Transformer-based sentiment analysis
├── computer_vision/    # Image & video analysis (HF / NVIDIA)
├── voice/              # Whisper speech-to-text
├── embeddings/         # Sentence Transformers embedding generation
├── chatbot/            # LangChain + LangGraph RAG agent
└── forecasting/        # Prophet / LSTM complaint volume forecasting
```

## Notes

- Each service can be deployed independently or integrated into the main backend.
- Services communicate with the backend via the Celery task queue or direct HTTP calls.
- Model weights and caches are stored in `/models_cache/` (gitignored).
- Configuration is driven by the same `.env` file as the main backend.
