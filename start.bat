@echo off
chcp 65001 > nul
title 쉬운 영어 번역기
echo ===================================================
echo     쉬운 영어 번역기 (Easy English Translator)
echo ===================================================
echo.
echo 웹 브라우저를 실행합니다...
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo 파이썬이 설치되어 있지 않거나 실행 오류가 발생하여 기본 브라우저로 파일을 엽니다.
    start index.html
)
pause
