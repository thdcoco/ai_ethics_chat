# backend/gpt_api.py

import os
from dotenv import load_dotenv

# OpenAI의 새로운 클라이언트 인터페이스를 불러옵니다.
# (openai 패키지 1.x 버전부터는 아래와 같이 사용해야 합니다.)
from openai import OpenAI

load_dotenv()

# OpenAI API 키를 환경변수에서 가져와 설정
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key is None:
    raise RuntimeError("`.env` 파일에 OPENAI_API_KEY 가 설정되어 있지 않습니다.")

# OpenAI 클라이언트 초기화
client = OpenAI(api_key=openai_api_key)


def generate_gpt_response(user_message: str) -> str:
    """
    GPT-4 응답 생성 (새로운 openai 1.x 방식)
    """
    # client.chat.completions.create 로 요청을 보내며, 
    # 반환된 객체 구조가 v1 인터페이스에 맞춰져 있습니다.
    resp = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 윤리적이고 정중한 AI입니다."},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
    )
    # v1 인터페이스에서 결과를 얻는 법
    return resp.choices[0].message.content


def moderate_text(text: str) -> dict:
    """
    Moderation API를 통해 GPT 응답의 안전성 검사 (새로운 openai 1.x 방식)
    """
    result = client.moderations.create(input=text)
    # result.results 는 리스트이므로 첫 번째 항목을 사용
    flagged = result.results[0].flagged
    categories = result.results[0].categories
    return {
        "flagged": flagged,
        "categories": categories,
    }


def explain_why_blocked(text: str) -> str:
    """
    GPT가 직접 '왜 차단되었는지' 설명 생성 (새로운 v1 방식)
    """
    resp = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "당신은 윤리 감수성이 뛰어난 AI 윤리 감시자입니다. "
                           "사용자의 문장이 왜 차단될 수 있는지 명확하게 설명해 주세요.",
            },
            {
                "role": "user",
                "content": f"다음 문장이 왜 비윤리적이거나 차단될 수 있는지 설명해주세요:\n\n\"{text}\"",
            },
        ],
        temperature=0.7,
    )
    return resp.choices[0].message.content
