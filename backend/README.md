# Slide Master backend

This service runs the upstream `byungjunjang/slide-master` repository through a Codex worker. It does not imitate the design rules with a separate PPT library: the worker reads the upstream repository instructions, authors the SVG deck, compiles it through `svg_to_pptx.py`, renders it, and runs the repository verification gate.

## Required environment

- `OPENAI_API_KEY`: used by Codex CLI.
- `BACKEND_API_TOKEN`: bearer token shared with the web app.
- `SLIDE_MASTER_ROOT`: defaults to `/opt/slide-master` in Docker.
- Persistent `/data` disk for jobs and exported decks.

## API

- `GET /health`
- `POST /v1/decks`
- `GET /v1/decks/{job_id}`
- `GET /v1/decks/{job_id}/download`

Deck generation is asynchronous because a fully rendered and verified deck can take several minutes. The web client should create a job, poll its status, and download only after `status=complete`.

