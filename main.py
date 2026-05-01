#!/usr/bin/env python
"""
VoiceStep 개발 서버 시작 스크립트
frontend (React + Vite)와 backend (FastAPI)를 동시에 실행합니다.

사용법:
  python main.py
"""

import subprocess
import sys
import signal
import threading
import time
from pathlib import Path
import shutil

# VoiceStep 루트 디렉토리
ROOT_DIR = Path(__file__).parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_DIR = ROOT_DIR / "backend"

# 프로세스 저장
processes = []


def print_header(title: str) -> None:
    """헤더 출력"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def cleanup(signum=None, frame=None) -> None:
    """프로세스 종료"""
    print("\n\n🛑 종료 중...")
    for process in processes:
        try:
            process.terminate()
            process.wait(timeout=3)
        except (subprocess.TimeoutExpired, ProcessLookupError):
            try:
                process.kill()
            except:
                pass
    print("✓ 모든 프로세스가 종료되었습니다.")
    sys.exit(0)


def stream_output(process: subprocess.Popen, prefix: str) -> None:
    """프로세스 출력을 실시간으로 스트림"""
    try:
        while True:
            line = process.stdout.readline()
            if not line:
                break
            if line.strip():
                print(f"  [{prefix}] {line.rstrip()}")
    except:
        pass


def find_npm_executable() -> str:
    """npm 실행 파일 찾기 (PATH에서 검색)"""
    npm_path = shutil.which("npm") or shutil.which("npm.cmd")
    return npm_path or ""

def start_frontend() -> subprocess.Popen:
    """Frontend 개발 서버 시작"""
    print_header("Frontend 시작 (http://localhost:5173)")

    if not FRONTEND_DIR.exists():
        print(f"❌ frontend 디렉토리를 찾을 수 없습니다: {FRONTEND_DIR}")
        sys.exit(1)

    npm_path = find_npm_executable()
    if not npm_path:
        print("❌ npm을 찾을 수 없습니다. Node.js와 npm이 설치되어 있는지 확인하세요.")
        print("현재 환경에서는 npm 또는 npm.cmd를 찾지 못했습니다.")
        sys.exit(1)

    print(f"✓ npm 경로 확인: {npm_path}")

    try:
        process = subprocess.Popen(
            [npm_path, "run", "dev"],
            cwd=FRONTEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        print(f"✓ Frontend 프로세스 시작 (PID: {process.pid})")

        # 별도 스레드에서 출력 처리
        thread = threading.Thread(
            target=stream_output, args=(process, "Frontend"), daemon=True
        )
        thread.start()

        return process

    except FileNotFoundError:
        print("❌ npm 실행 파일을 찾을 수 없습니다.")
        print(f"확인된 npm 경로: {npm_path}")
        sys.exit(1)


def start_backend() -> subprocess.Popen:
    """Backend 개발 서버 시작"""
    print_header("Backend 시작 (http://localhost:8000)")

    if not BACKEND_DIR.exists():
        print(f"❌ backend 디렉토리를 찾을 수 없습니다: {BACKEND_DIR}")
        sys.exit(1)

    # Python 환경 확인
    try:
        result = subprocess.run(
            [sys.executable, "-c", "import fastapi; import uvicorn"],
            capture_output=True,
            cwd=BACKEND_DIR,
        )
        if result.returncode != 0:
            print("❌ FastAPI/Uvicorn이 설치되지 않았습니다.")
            print("다음 명령을 실행하세요: pip install fastapi uvicorn python-dotenv")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Python 환경 확인 중 오류: {e}")
        sys.exit(1)

    try:
        process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.main:app",
                "--reload",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
            ],
            cwd=BACKEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
        print(f"✓ Backend 프로세스 시작 (PID: {process.pid})")

        # 별도 스레드에서 출력 처리
        thread = threading.Thread(
            target=stream_output, args=(process, "Backend"), daemon=True
        )
        thread.start()

        return process
    except FileNotFoundError:
        print(f"❌ Python을 찾을 수 없습니다: {sys.executable}")
        sys.exit(1)


def main():
    """메인 함수"""
    print("\n")
    print("╔════════════════════════════════════════════════════════════════════════╗")
    print("║                  VoiceStep 개발 환경 시작                             ║")
    print("╚════════════════════════════════════════════════════════════════════════╝")

    # 신호 처리 설정 (Ctrl+C)
    signal.signal(signal.SIGINT, cleanup)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, cleanup)

    # Frontend와 Backend 시작
    frontend_process = start_frontend()
    processes.append(frontend_process)

    time.sleep(1)

    backend_process = start_backend()
    processes.append(backend_process)

    print_header("✨ 서버 실행 중 ✨")
    print("📱 Frontend: http://localhost:5173")
    print("🔌 Backend: http://localhost:8000")
    print("📚 API 문서: http://localhost:8000/docs")
    print("\n⌨️  Ctrl+C를 누르면 모든 서버가 종료됩니다.\n")

    # 메인 스레드에서 프로세스 모니터링
    down_count = {"frontend": 0, "backend": 0}
    while True:
        # Frontend 프로세스 체크 (2회 연속 실패시 종료)
        if frontend_process.poll() is not None:
            down_count["frontend"] += 1
            if down_count["frontend"] >= 2:
                print("\n❌ Frontend 프로세스가 종료되었습니다.")
                cleanup()
        else:
            down_count["frontend"] = 0

        # Backend 프로세스 체크 (2회 연속 실패시 종료)
        if backend_process.poll() is not None:
            down_count["backend"] += 1
            if down_count["backend"] >= 2:
                print("\n❌ Backend 프로세스가 종료되었습니다.")
                cleanup()
        else:
            down_count["backend"] = 0

        time.sleep(2)


if __name__ == "__main__":
    main()
