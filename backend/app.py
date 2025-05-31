# ai_ethics_chat/backend/app.py

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 같은 디렉터리(backend)에 있는 gpt_api.py 를 import
from gpt_api import generate_gpt_response, moderate_text, explain_why_blocked

app = FastAPI()

# CORS 허용 설정 (React 프론트엔드에서 5173 포트로 요청할 때 허용되도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # 실제 배포 시에는 허용할 도메인만 명시적으로 적어주세요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str


@app.post("/chat")
def chat_endpoint(msg: Message):
    user_message = msg.message

    # 1) ***사용자 메시지에 대해 모더레이션(검사) 수행***
    #    -> 욕설, 증오, 폭력, 성적 요청 등 부적절한 사용자 입력이 flagged=True로 감지되는지 확인
    user_moderation = moderate_text(user_message)
    if user_moderation["flagged"]:
        # flagged된 카테고리들(예: harassment, hate, violence 등)만 골라내기
        flagged_list = [
            category for category, flagged in user_moderation["categories"].items() if flagged
        ]
        # ☠️ APE 경고 메시지
        warning_text = "⚠️ 감지된 윤리적 이슈: " + ", ".join(flagged_list)

        # 💡 APE 제안 메시지
        suggestion_text = "💡 부적절한 표현 대신 좀 더 중립적인 어투로 다시 말씀해 주세요."

        # 🧠 차단 이유 설명: explain_why_blocked 함수를 써서 그 이유를 생성
        #    (여기서는 사용자 메시지를 설명하도록 넘깁니다)
        explanation_text = "🧠 " + explain_why_blocked(user_message)

        return {
            "reply": warning_text,
            "categories": user_moderation["categories"],
            "suggestion": suggestion_text,
            "explanation": explanation_text
        }

    # 2) 사용자 입력이 안전하다고 판단되면, GPT-4에게 정상 답변 요청
    gpt_reply = generate_gpt_response(user_message)

    # 3) (선택) GPT가 생성한 답변 자체에 대해서도 한번 더 모더레이션을 돌려보고 싶다면 여기에 추가
    #    예시로, gpt_reply가 flagged=True인 경우를 대비하는 코드를 넣어두었습니다.
    gpt_moderation = moderate_text(gpt_reply)
    if gpt_moderation["flagged"]:
        flagged_list = [
            category for category, flagged in gpt_moderation["categories"].items() if flagged
        ]
        warning_text = "⚠️ GPT 응답이 안전하지 않습니다: " + ", ".join(flagged_list)
        suggestion_text = "💡 GPT가 좀 더 안전한 언어를 사용하도록 유도했습니다. 다시 시도해 보세요."
        explanation_text = "🧠 " + explain_why_blocked(gpt_reply)

        return {
            "reply": warning_text,
            "categories": gpt_moderation["categories"],
            "suggestion": suggestion_text,
            "explanation": explanation_text
        }

    # 4) 끝까지 문제 없다면, 정상 GPT 응답을 회색(bubble)으로만 반환
    return {
        "reply": gpt_reply,
        "categories": {},
        "suggestion": None,
        "explanation": None
    }
