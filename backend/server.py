from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv
import os
import base64
import json
from datetime import datetime, date, timedelta
import anthropic
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="NutriSnap API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# ============ MODELS ============

class ProfileCreate(BaseModel):
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_base64: Optional[str] = None
    age: int
    weight: float
    height: float
    goal: str  # 'lose_weight', 'maintain', 'gain_muscle'
    language: str = 'fr'

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_base64: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    goal: Optional[str] = None
    daily_calories: Optional[int] = None
    language: Optional[str] = None

class MealAnalysisRequest(BaseModel):
    user_id: str
    image_base64: str
    language: str = 'fr'

class MealCreate(BaseModel):
    user_id: str
    image_base64: Optional[str] = None
    foods: List[str]
    calories: int
    protein: float
    carbs: float
    fat: float
    score: int
    feedback: str

class SubscriptionCreate(BaseModel):
    user_id: str
    plan: str = 'free'  # 'free', 'monthly', 'yearly'

class AnalysisCountCheck(BaseModel):
    user_id: str

# ============ HELPER FUNCTIONS ============

def calculate_daily_calories(weight: float, height: float, age: int, goal: str) -> int:
    """Calculate recommended daily calories using Mifflin-St Jeor equation (average for both genders)"""
    # Base metabolic rate (average between male and female formula)
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    
    # Activity multiplier (moderate activity assumed)
    tdee = bmr * 1.55
    
    # Adjust based on goal
    if goal == 'lose_weight':
        return int(tdee - 500)  # Deficit
    elif goal == 'gain_muscle':
        return int(tdee + 300)  # Surplus
    else:
        return int(tdee)  # Maintain

def get_language_prompt(language: str) -> str:
    """Get the appropriate language instruction for Claude"""
    prompts = {
        'fr': "Réponds en français.",
        'de': "Antworte auf Deutsch.",
        'it': "Rispondi in italiano."
    }
    return prompts.get(language, prompts['fr'])

async def analyze_meal_with_claude(image_base64: str, language: str) -> dict:
    """Analyze meal image using Claude Vision API"""
    
    language_instruction = get_language_prompt(language)
    
    system_prompt = f"""Tu es un nutritionniste expert et coach sportif. Analyse l'image du repas fournie.
{language_instruction}

Tu dois retourner UNIQUEMENT un JSON valide avec cette structure exacte:
{{
    "foods": ["liste", "des", "aliments", "détectés"],
    "calories": nombre_entier_estimé,
    "macros": {{
        "protein": nombre_en_grammes,
        "carbs": nombre_en_grammes,
        "fat": nombre_en_grammes
    }},
    "score": nombre_de_0_à_10,
    "feedback": "message de coaching personnalisé et motivant"
}}

Critères de score:
- 8-10: Excellent repas équilibré, riche en nutriments
- 6-7: Bon repas avec quelques améliorations possibles
- 4-5: Repas moyen, manque d'équilibre
- 0-3: Repas peu nutritif, trop calorique ou déséquilibré

Le feedback doit être:
- Encourageant et positif
- Donner un conseil concret
- Maximum 2 phrases
- Dans la langue demandée"""

    try:
        # Determine media type
        if image_base64.startswith('/9j/'):
            media_type = "image/jpeg"
        elif image_base64.startswith('iVBOR'):
            media_type = "image/png"
        else:
            media_type = "image/jpeg"  # Default

        message = claude_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": system_prompt
                        }
                    ],
                }
            ],
        )
        
        # Extract JSON from response
        response_text = message.content[0].text
        
        # Try to parse JSON from response
        # Sometimes Claude wraps it in markdown code blocks
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            json_str = response_text.split("```")[1].split("```")[0].strip()
        else:
            json_str = response_text.strip()
        
        result = json.loads(json_str)
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Response was: {response_text}")
        # Return a default response if parsing fails
        return {
            "foods": ["Repas non identifié"],
            "calories": 500,
            "macros": {"protein": 20, "carbs": 50, "fat": 20},
            "score": 5,
            "feedback": "Je n'ai pas pu analyser ce repas précisément. Essayez avec une photo plus claire!"
        }
    except Exception as e:
        print(f"Claude API error: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing meal: {str(e)}")


# ============ API ENDPOINTS ============

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ---- PROFILES ----

@app.post("/api/profiles")
async def create_profile(profile: ProfileCreate):
    """Create a new user profile"""
    try:
        # Calculate daily calories
        daily_calories = calculate_daily_calories(
            profile.weight, profile.height, profile.age, profile.goal
        )
        
        data = {
            "user_id": profile.user_id,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "photo_base64": profile.photo_base64,
            "age": profile.age,
            "weight": profile.weight,
            "height": profile.height,
            "goal": profile.goal,
            "daily_calories": daily_calories,
            "language": profile.language,
        }
        
        result = supabase.table("profiles").insert(data).execute()
        
        # Also create initial subscription (14-day trial)
        trial_end = (datetime.now() + timedelta(days=14)).isoformat()
        sub_data = {
            "user_id": profile.user_id,
            "status": "trial",
            "plan": "free",
            "trial_end_date": trial_end,
            "is_active": True,
        }
        supabase.table("subscriptions").insert(sub_data).execute()
        
        # Create initial streak
        streak_data = {
            "user_id": profile.user_id,
            "current_streak": 0,
            "longest_streak": 0,
            "last_active_date": datetime.now().date().isoformat(),
        }
        supabase.table("streaks").insert(streak_data).execute()
        
        return {"success": True, "profile": result.data[0] if result.data else data}
    except Exception as e:
        print(f"Error creating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profiles/{user_id}")
async def get_profile(user_id: str):
    """Get user profile by user_id"""
    try:
        result = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/profiles/{user_id}")
async def update_profile(user_id: str, profile: ProfileUpdate):
    """Update user profile"""
    try:
        update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
        
        # Recalculate calories if weight, height, age, or goal changed
        if any(k in update_data for k in ['weight', 'height', 'age', 'goal']):
            current = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
            if current.data:
                current_profile = current.data[0]
                weight = update_data.get('weight', current_profile['weight'])
                height = update_data.get('height', current_profile['height'])
                age = update_data.get('age', current_profile['age'])
                goal = update_data.get('goal', current_profile['goal'])
                update_data['daily_calories'] = calculate_daily_calories(weight, height, age, goal)
        
        result = supabase.table("profiles").update(update_data).eq("user_id", user_id).execute()
        return {"success": True, "profile": result.data[0] if result.data else update_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- MEAL ANALYSIS ----

@app.post("/api/analyze-meal")
async def analyze_meal(request: MealAnalysisRequest):
    """Analyze a meal image using Claude Vision"""
    try:
        # Check if user has remaining analyses today (for free users)
        subscription = supabase.table("subscriptions").select("*").eq("user_id", request.user_id).execute()
        
        is_premium = False
        if subscription.data:
            sub = subscription.data[0]
            is_premium = sub['is_active'] and sub['plan'] != 'free'
            
            # Check trial status
            if sub['status'] == 'trial':
                trial_end = datetime.fromisoformat(sub['trial_end_date'].replace('Z', '+00:00'))
                if datetime.now(trial_end.tzinfo) > trial_end:
                    # Trial expired, update status
                    supabase.table("subscriptions").update({
                        "status": "expired",
                        "is_active": False
                    }).eq("user_id", request.user_id).execute()
                    is_premium = False
        
        if not is_premium:
            # Check daily limit (3 per day for free users)
            today = datetime.now().date().isoformat()
            meals_today = supabase.table("meals").select("id").eq("user_id", request.user_id).gte("created_at", today).execute()
            if len(meals_today.data or []) >= 3:
                raise HTTPException(status_code=429, detail="Daily analysis limit reached. Upgrade to Premium!")
        
        # Analyze the meal
        analysis = await analyze_meal_with_claude(request.image_base64, request.language)
        
        return {
            "success": True,
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_meal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---- MEALS ----

@app.post("/api/meals")
async def create_meal(meal: MealCreate):
    """Save a meal to the database"""
    try:
        data = {
            "user_id": meal.user_id,
            "image_base64": meal.image_base64,
            "foods": meal.foods,
            "calories": meal.calories,
            "protein": meal.protein,
            "carbs": meal.carbs,
            "fat": meal.fat,
            "score": meal.score,
            "feedback": meal.feedback,
        }
        
        result = supabase.table("meals").insert(data).execute()
        
        # Update daily stats
        today = datetime.now().date().isoformat()
        existing_stats = supabase.table("daily_stats").select("*").eq("user_id", meal.user_id).eq("date", today).execute()
        
        if existing_stats.data:
            # Update existing
            stats = existing_stats.data[0]
            supabase.table("daily_stats").update({
                "total_calories": stats["total_calories"] + meal.calories,
                "protein": stats["protein"] + meal.protein,
                "carbs": stats["carbs"] + meal.carbs,
                "fat": stats["fat"] + meal.fat,
                "meals_count": stats["meals_count"] + 1,
            }).eq("id", stats["id"]).execute()
        else:
            # Create new
            supabase.table("daily_stats").insert({
                "user_id": meal.user_id,
                "date": today,
                "total_calories": meal.calories,
                "protein": meal.protein,
                "carbs": meal.carbs,
                "fat": meal.fat,
                "meals_count": 1,
            }).execute()
        
        # Update streak
        streak_result = supabase.table("streaks").select("*").eq("user_id", meal.user_id).execute()
        if streak_result.data:
            streak = streak_result.data[0]
            last_active = datetime.fromisoformat(streak["last_active_date"]).date()
            today_date = datetime.now().date()
            
            if last_active == today_date - timedelta(days=1):
                # Consecutive day
                new_streak = streak["current_streak"] + 1
                supabase.table("streaks").update({
                    "current_streak": new_streak,
                    "longest_streak": max(new_streak, streak["longest_streak"]),
                    "last_active_date": today,
                }).eq("user_id", meal.user_id).execute()
            elif last_active < today_date - timedelta(days=1):
                # Streak broken
                supabase.table("streaks").update({
                    "current_streak": 1,
                    "last_active_date": today,
                }).eq("user_id", meal.user_id).execute()
            # If same day, don't update streak
        
        return {"success": True, "meal": result.data[0] if result.data else data}
    except Exception as e:
        print(f"Error creating meal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/meals/{user_id}")
async def get_meals(user_id: str, limit: int = 50, offset: int = 0):
    """Get user meals with pagination"""
    try:
        result = supabase.table("meals").select("*").eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return {"meals": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/meals/{user_id}/today")
async def get_today_meals(user_id: str):
    """Get today's meals for a user"""
    try:
        today = datetime.now().date().isoformat()
        result = supabase.table("meals").select("*").eq("user_id", user_id).gte("created_at", today).order("created_at", desc=True).execute()
        return {"meals": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- DAILY STATS ----

@app.get("/api/stats/{user_id}/today")
async def get_today_stats(user_id: str):
    """Get today's stats for a user"""
    try:
        today = datetime.now().date().isoformat()
        result = supabase.table("daily_stats").select("*").eq("user_id", user_id).eq("date", today).execute()
        
        if result.data:
            return result.data[0]
        else:
            return {
                "user_id": user_id,
                "date": today,
                "total_calories": 0,
                "protein": 0,
                "carbs": 0,
                "fat": 0,
                "meals_count": 0,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- STREAKS ----

@app.get("/api/streaks/{user_id}")
async def get_streak(user_id: str):
    """Get user streak"""
    try:
        result = supabase.table("streaks").select("*").eq("user_id", user_id).execute()
        if result.data:
            return result.data[0]
        else:
            return {
                "user_id": user_id,
                "current_streak": 0,
                "longest_streak": 0,
                "last_active_date": None,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- SUBSCRIPTIONS ----

@app.get("/api/subscriptions/{user_id}")
async def get_subscription(user_id: str):
    """Get user subscription"""
    try:
        result = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
        if result.data:
            sub = result.data[0]
            # Check trial expiration
            if sub['status'] == 'trial':
                trial_end = datetime.fromisoformat(sub['trial_end_date'].replace('Z', '+00:00'))
                if datetime.now(trial_end.tzinfo) > trial_end:
                    supabase.table("subscriptions").update({
                        "status": "expired",
                        "is_active": False
                    }).eq("user_id", user_id).execute()
                    sub['status'] = 'expired'
                    sub['is_active'] = False
            return sub
        else:
            return {
                "user_id": user_id,
                "status": "none",
                "plan": "free",
                "is_active": False,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/subscriptions")
async def create_subscription(sub: SubscriptionCreate):
    """Create or update subscription (called after RevenueCat webhook)"""
    try:
        trial_end = (datetime.now() + timedelta(days=14)).isoformat()
        
        # Check if subscription exists
        existing = supabase.table("subscriptions").select("*").eq("user_id", sub.user_id).execute()
        
        if existing.data:
            # Update
            result = supabase.table("subscriptions").update({
                "plan": sub.plan,
                "status": "active" if sub.plan != 'free' else "trial",
                "is_active": True,
            }).eq("user_id", sub.user_id).execute()
        else:
            # Create
            data = {
                "user_id": sub.user_id,
                "status": "trial",
                "plan": sub.plan,
                "trial_end_date": trial_end,
                "is_active": True,
            }
            result = supabase.table("subscriptions").insert(data).execute()
        
        return {"success": True, "subscription": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
