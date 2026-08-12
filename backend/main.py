from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "AI Voice Agent Backend is Running"
    }


# =========================
# FRONTEND TEST
# =========================

@app.get("/api/test")
def test():
    return {
        "status": "success",
        "message": "Frontend successfully connected to backend!"
    }


# =========================
# API KEY TEST
# =========================

@app.get("/api/key-test")
def key_test():

    api_key = os.getenv("OLLAMA_API_KEY")

    return {
        "configured": bool(api_key),
        "length": len(api_key) if api_key else 0
    }


# =========================
# CHAT
# =========================

@app.post("/chat")
def chat(data: dict):

    user_message = data.get("message", "").strip()

    if not user_message:
        return {
            "response": "Please enter a message."
        }

    try:

        # =========================
        # GET OLLAMA API KEY
        # =========================

        api_key = os.getenv("OLLAMA_API_KEY")

        if not api_key:
            return {
                "response": "OLLAMA_API_KEY is not configured."
            }


        # =========================
        # DREAMY WORLD PROPERTY PROMPT
        # =========================

        prompt = f"""
You are Dreamy World AI, a professional real estate property assistant.

Your job is to help users with:

- Buying properties
- Renting properties
- Selling properties
- Property investment
- Houses
- Apartments
- Plots
- Commercial properties
- Property locations
- Property budgets
- Bedrooms and bathrooms
- Property features

IMPORTANT RULES:

1. Keep your answers SHORT and useful.

2. Normally answer in 2 to 4 sentences.

3. Do NOT create huge tables.

4. Do NOT give unnecessary long explanations.

5. Be friendly, professional and natural.

6. If the user is looking for a property, ask about:
   - Location
   - Budget
   - Buy or rent
   - Property type

7. Ask only 1 or 2 questions at a time.
   Do not ask 8 questions together.

8. Never invent real property listings,
   prices or availability.

9. If the user asks something unrelated to real estate,
   politely explain that you are a property assistant.

10. Answer in the same language as the user whenever possible.

11. If the user gives some property details,
    use those details in your next answer.

12. Do not repeat questions that the user has already answered.

13. Give practical and direct answers.

14. Never say that you can actually book or purchase
    a property unless a real booking system is connected.

User question:

{user_message}

Give a short, natural and helpful answer.
"""


        # =========================
        # OLLAMA CLOUD
        # =========================

        response = requests.post(

            "https://ollama.com/api/generate",

            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },

            json={
                "model": "gpt-oss:120b",
                "prompt": prompt,
                "stream": False
            },

            timeout=300
        )


        # =========================
        # CHECK RESPONSE
        # =========================

        response.raise_for_status()

        result = response.json()


        # =========================
        # RETURN AI RESPONSE
        # =========================

        return {
            "response": result.get(
                "response",
                "AI did not return a response."
            )
        }


    # =========================
    # ERRORS
    # =========================

    except requests.exceptions.Timeout:

        return {
            "response": "AI took too long to respond. Please try again."
        }


    except requests.exceptions.ConnectionError:

        return {
            "response": "Cannot connect to Ollama Cloud."
        }


    except requests.exceptions.HTTPError as e:

        return {
            "response": f"Ollama API error: {str(e)}"
        }


    except Exception as e:

        return {
            "response": f"Backend error: {str(e)}"
        }