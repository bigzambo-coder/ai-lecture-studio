from __future__ import annotations

import asyncio
import json
import os
import shutil
import subprocess
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

ROOT = Path(os.environ.get("SLIDE_MASTER_ROOT", "/opt/slide-master")).resolve()
DATA = Path(os.environ.get("JOB_DATA_ROOT", "/data/jobs")).resolve()
TOKEN = os.environ.get("BACKEND_API_TOKEN", "")
CODEX_BIN = os.environ.get("CODEX_BIN", "codex")
DATA.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="AI Lecture Studio · Slide Master Worker", version="1.0.0")


class DeckRequest(BaseModel):
    project_title: str = Field(min_length=2, max_length=120)
    institution_name: str = ""
    institution_type: str
    audience: str
    topic: str
    total_minutes: int = Field(ge=30, le=1440)
    purpose: str = ""
    objectives: list[str] = Field(default_factory=list)
    final_deliverable: str = ""
    design_preset: str = "auto"
    design_request: str = "전문적이고 세련된 교육용 프레젠테이션"
    notion_url: str = ""
    source_project: str = "my-lecture"


class Job(BaseModel):
    id: str
    status: Literal["queued", "running", "complete", "failed"]
    created_at: str
    updated_at: str
    progress: str = ""
    error: str = ""
    pptx: str = ""
    qa_report: str = ""


def authorize(value: str | None) -> None:
    if TOKEN and value != f"Bearer {TOKEN}":
        raise HTTPException(401, "유효한 백엔드 토큰이 필요합니다.")


def job_dir(job_id: str) -> Path:
    if not job_id.replace("-", "").isalnum():
        raise HTTPException(400, "잘못된 작업 ID입니다.")
    return DATA / job_id


def load_job(job_id: str) -> Job:
    path = job_dir(job_id) / "job.json"
    if not path.exists():
        raise HTTPException(404, "작업을 찾을 수 없습니다.")
    return Job.model_validate_json(path.read_text(encoding="utf-8"))


def save_job(job: Job) -> None:
    folder = job_dir(job.id)
    folder.mkdir(parents=True, exist_ok=True)
    job.updated_at = datetime.now(timezone.utc).isoformat()
    (folder / "job.json").write_text(job.model_dump_json(indent=2), encoding="utf-8")


def prompt_for(req: DeckRequest, project: Path) -> str:
    slide_target = max(15, min(60, round(req.total_minutes / 4)))
    return f"""projects/{project.name}/sources/request.json을 읽고 편집 가능한 강의용 PPTX를 만들어라.

이 작업은 새 덱을 만드는 main SVG generation route다. 저장소 AGENTS.md와 routing.md를 먼저 읽고 선택된 canonical owner를 끝까지 따른다. 사용자와 대화할 수 없는 자동 작업이므로 입력 JSON의 design_request를 승인된 디자인 방향으로 간주하되, 나머지 필수 게이트·검증·렌더링은 생략하지 않는다.

- 기관: {req.institution_name or req.institution_type} ({req.institution_type})
- 대상: {req.audience}
- 주제: {req.topic}
- 시간: {req.total_minutes}분
- 권장 분량: 약 {slide_target}장. 강의와 실습 구조에 따라 조정 가능
- 디자인: {req.design_request}; 프리셋 힌트 {req.design_preset}
- 결과물: {req.final_deliverable or '교육 목표에 맞는 실제 결과물'}
- 참고자료: projects/{project.name}/sources/ 안의 파일과 이미지

PPT 안의 모든 실습에는 PRACTICE-01 형식의 ID를 넣고, 발표자 노트에도 동일 ID와 Notion 연결 정보를 기록한다. 결과는 projects/{project.name}/exports/에 저장하고 verify_deck.py 및 최종 렌더 몽타주 확인까지 완료하라. 중간 확인이 불가능해 차단되는 항목은 추측하지 말고 request.json의 값과 [기관 확인 필요] 표기를 사용하라.
"""


async def run_job(job_id: str, req: DeckRequest) -> None:
    job = load_job(job_id)
    job.status = "running"
    job.progress = "Slide Master 프로젝트 준비"
    save_job(job)
    folder = job_dir(job_id)
    project = ROOT / "projects" / f"api-{job_id}"
    try:
        if not (ROOT / "AGENTS.md").exists():
            raise RuntimeError("SLIDE_MASTER_ROOT에 slide-master 저장소가 없습니다.")
        for name in ("sources", "analysis", "images", "svg_output", "exports", "backup"):
            (project / name).mkdir(parents=True, exist_ok=True)
        source = ROOT / "projects" / req.source_project / "sources"
        if source.exists():
            for item in source.iterdir():
                target = project / "sources" / item.name
                if item.is_file() and not target.exists():
                    shutil.copy2(item, target)
        (project / "sources" / "request.json").write_text(
            json.dumps(req.model_dump(), ensure_ascii=False, indent=2), encoding="utf-8"
        )
        job.progress = "Codex가 Slide Master 규칙으로 PPT 제작 중"
        save_job(job)
        env = os.environ.copy()
        process = await asyncio.create_subprocess_exec(
            CODEX_BIN, "exec", "--full-auto", "--sandbox", "workspace-write",
            "-C", str(ROOT), prompt_for(req, project),
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT, env=env,
        )
        output, _ = await process.communicate()
        (folder / "worker.log").write_bytes(output or b"")
        if process.returncode != 0:
            raise RuntimeError(f"Codex 작업자가 종료 코드 {process.returncode}를 반환했습니다.")
        exports = sorted((project / "exports").glob("*.pptx"), key=lambda p: p.stat().st_mtime)
        if not exports:
            raise RuntimeError("Slide Master가 PPTX를 생성하지 못했습니다.")
        result = folder / "result.pptx"
        shutil.copy2(exports[-1], result)
        reports = sorted(project.glob("**/*qa*.json"), key=lambda p: p.stat().st_mtime)
        if reports:
            qa = folder / "qa.json"
            shutil.copy2(reports[-1], qa)
            job.qa_report = str(qa)
        job.pptx = str(result)
        job.status = "complete"
        job.progress = "PPTX 생성·렌더링·검수 완료"
    except Exception as exc:
        job.status = "failed"
        job.error = str(exc)
        job.progress = "작업 실패"
    finally:
        save_job(job)


@app.get("/health")
def health():
    return {
        "ok": ROOT.exists(),
        "slide_master_root": str(ROOT),
        "codex_available": shutil.which(CODEX_BIN) is not None,
        "engine": "slide-master-agent-worker",
    }


@app.post("/v1/decks", response_model=Job, status_code=202)
def create_deck(req: DeckRequest, tasks: BackgroundTasks, authorization: str | None = Header(default=None)):
    authorize(authorization)
    now = datetime.now(timezone.utc).isoformat()
    job = Job(id=str(uuid.uuid4()), status="queued", created_at=now, updated_at=now, progress="대기열 등록")
    save_job(job)
    tasks.add_task(run_job, job.id, req)
    return job


@app.get("/v1/decks", response_model=list[Job])
def list_decks(authorization: str | None = Header(default=None)):
    authorize(authorization)
    jobs: list[Job] = []
    if not DATA.exists():
        return jobs
    for path in DATA.glob("*/job.json"):
        try:
            jobs.append(Job.model_validate_json(path.read_text(encoding="utf-8")))
        except Exception:
            continue
    return sorted(jobs, key=lambda item: item.created_at, reverse=True)[:100]


@app.get("/v1/decks/{job_id}", response_model=Job)
def get_deck(job_id: str, authorization: str | None = Header(default=None)):
    authorize(authorization)
    return load_job(job_id)


@app.get("/v1/decks/{job_id}/download")
def download_deck(job_id: str, authorization: str | None = Header(default=None)):
    authorize(authorization)
    job = load_job(job_id)
    if job.status != "complete" or not job.pptx:
        raise HTTPException(409, "아직 다운로드할 PPTX가 없습니다.")
    return FileResponse(job.pptx, filename=f"slide-master-{job_id}.pptx", media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")
