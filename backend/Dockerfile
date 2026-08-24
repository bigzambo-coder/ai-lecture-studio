FROM python:3.12-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git libreoffice fonts-noto-cjk nodejs npm \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @openai/codex
RUN git clone --depth 1 https://github.com/byungjunjang/slide-master.git /opt/slide-master
RUN pip install --no-cache-dir -r /opt/slide-master/requirements.txt

WORKDIR /service
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/app.py ./app.py

ENV SLIDE_MASTER_ROOT=/opt/slide-master
ENV JOB_DATA_ROOT=/data/jobs
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]

