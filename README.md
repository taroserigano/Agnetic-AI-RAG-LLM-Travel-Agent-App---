Next.js ChatGPT App

Ask any questions you wanna ask
![alt text](https://github.com/taroserigano/Next.js-ChatGPT_App-Master/blob/main/img/pic4.jpg)

Ask about any cities in the world and it will generate recommended places for you to visit.
The app will create your trip plans for you and save the data on the cloud postgre SQL DB - so you can re-visit.
![alt text](https://github.com/taroserigano/Next.js-ChatGPT_App-Master/blob/main/img/tours1.jpg)

It utilizes the generative image generation and generates image for you.
![alt text](https://github.com/taroserigano/Next.js-ChatGPT_App-Master/blob/main/img/tours2.jpg)

## Personal Knowledge Vault (RAG Uploads)

- New **Knowledge Vault** tab inside the dashboard sidebar lets you upload PDFs / text files with trip-specific context.
- Files are chunked, embedded with HuggingFace sentence-transformers, and indexed in FAISS via the Python `agentic-service`.
- Metadata (status, chunk count, token estimate) is stored in Postgres so you can track ingestion history.

### Required environment variable additions

```
AGENTIC_SERVICE_URL=http://localhost:8000
```

This URL should point at your running FastAPI service (`uvicorn main:app --port 8000`).

# Agentic_AI_RAG_LLM_Traveler_Site_App
