from fastapi import FastAPI, HTTPException, Depends, Header, Request, BackgroundTasks
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
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import email_service

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
    photo_url: Optional[str] = None
    age: int
    weight: float
    height: float
    goal: str  # 'lose_weight', 'maintain', 'gain_muscle'
    activity_level: str = 'moderate'  # 'sedentary', 'light', 'moderate', 'active'
    language: str = 'fr'

class ManualMealCreate(BaseModel):
    user_id: str
    food_name: str
    portion_g: float = 100
    calories: float
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    meal_type: str = 'lunch'  # 'breakfast', 'lunch', 'dinner', 'snack'

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    goal: Optional[str] = None
    daily_calories: Optional[int] = None
    language: Optional[str] = None

class PhotoUpload(BaseModel):
    user_id: str
    photo_base64: str

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

def calculate_daily_calories(weight: float, height: float, age: int, goal: str, activity_level: str = 'moderate') -> int:
    """Calculate recommended daily calories using Mifflin-St Jeor equation"""
    # Base metabolic rate (average between male and female formula)
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5

    # Activity multiplier based on level
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
    }
    multiplier = activity_multipliers.get(activity_level, 1.55)
    tdee = bmr * multiplier

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
        # Calculate daily calories with activity level
        daily_calories = calculate_daily_calories(
            profile.weight, profile.height, profile.age, profile.goal,
            profile.activity_level
        )

        data = {
            "user_id": profile.user_id,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "photo_url": profile.photo_url,
            "age": profile.age,
            "weight": profile.weight,
            "height": profile.height,
            "goal": profile.goal,
            "activity_level": profile.activity_level,
            "daily_calories": daily_calories,
            "language": profile.language,
        }

        result = supabase.table("profiles").insert(data).execute()

        # Also create initial subscription (7-day trial)
        trial_end = (datetime.now() + timedelta(days=7)).isoformat()
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
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-photo")
async def upload_photo(data: PhotoUpload):
    """Upload profile photo to Supabase Storage"""
    try:
        import uuid
        
        # Decode base64 image
        image_data = base64.b64decode(data.photo_base64)
        
        # Generate unique filename
        filename = f"{data.user_id}/{uuid.uuid4()}.jpg"
        
        # Upload to Supabase Storage
        result = supabase.storage.from_("photo").upload(
            path=filename,
            file=image_data,
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_("photo").get_public_url(filename)
        
        # Update profile with photo URL
        supabase.table("profiles").update({
            "photo_url": public_url
        }).eq("user_id", data.user_id).execute()
        
        return {"success": True, "photo_url": public_url}
    except Exception as e:
        print(f"Error uploading photo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---- WEIGHT TRACKING ----

class WeightEntry(BaseModel):
    user_id: str
    weight: float

@app.post("/api/weight")
async def add_weight_entry(entry: WeightEntry):
    """Add a weight entry for tracking"""
    try:
        data = {
            "user_id": entry.user_id,
            "weight": entry.weight,
            "date": datetime.now().date().isoformat(),
        }
        result = supabase.table("weight_history").insert(data).execute()
        
        # Also update current weight in profile
        supabase.table("profiles").update({
            "weight": entry.weight
        }).eq("user_id", entry.user_id).execute()
        
        return {"success": True, "entry": result.data[0] if result.data else data}
    except Exception as e:
        print(f"Error adding weight entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weight/{user_id}")
async def get_weight_history(user_id: str, days: int = 30):
    """Get weight history for a user"""
    try:
        from_date = (datetime.now() - timedelta(days=days)).date().isoformat()
        result = supabase.table("weight_history").select("*").eq("user_id", user_id).gte("date", from_date).order("date").execute()
        return {"entries": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- WEEKLY STATS ----

@app.get("/api/stats/{user_id}/weekly")
async def get_weekly_stats(user_id: str):
    """Get weekly nutrition stats for charts"""
    try:
        from_date = (datetime.now() - timedelta(days=7)).date().isoformat()
        result = supabase.table("daily_stats").select("*").eq("user_id", user_id).gte("date", from_date).order("date").execute()
        return {"stats": result.data or []}
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

@app.delete("/api/meals/{meal_id}")
async def delete_meal(meal_id: str, user_id: str):
    """Delete a meal by id (user_id required for ownership check)"""
    try:
        result = supabase.table("meals").delete().eq("id", meal_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Meal not found")
        return {"success": True}
    except HTTPException:
        raise
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

# ---- MANUAL MEAL ENTRY ----

@app.post("/api/meals/manual")
async def create_manual_meal(meal: ManualMealCreate):
    """Create a meal from manual entry (no photo)"""
    try:
        today = datetime.now().date().isoformat()
        score = 5  # neutral score for manually entered meals

        # Compute a basic score based on macros
        if meal.protein > 20 and meal.fat < 30:
            score = 7
        elif meal.calories < 400:
            score = 6

        data = {
            "user_id": meal.user_id,
            "date": today,
            "foods": [meal.food_name],
            "calories": int(meal.calories),
            "protein": meal.protein,
            "carbs": meal.carbs,
            "fat": meal.fat,
            "score": score,
            "feedback": f"Repas enregistré manuellement : {meal.food_name} ({int(meal.calories)} kcal)",
            "meal_type": meal.meal_type,
            "portion_g": meal.portion_g,
        }

        result = supabase.table("meals").insert(data).execute()

        # Update daily stats
        stats = supabase.table("daily_stats").select("*").eq("user_id", meal.user_id).eq("date", today).execute()
        if stats.data:
            existing = stats.data[0]
            supabase.table("daily_stats").update({
                "total_calories": existing.get("total_calories", 0) + int(meal.calories),
                "protein": existing.get("protein", 0) + meal.protein,
                "carbs": existing.get("carbs", 0) + meal.carbs,
                "fat": existing.get("fat", 0) + meal.fat,
                "meals_count": existing.get("meals_count", 0) + 1,
            }).eq("user_id", meal.user_id).eq("date", today).execute()
        else:
            supabase.table("daily_stats").insert({
                "user_id": meal.user_id,
                "date": today,
                "total_calories": int(meal.calories),
                "protein": meal.protein,
                "carbs": meal.carbs,
                "fat": meal.fat,
                "meals_count": 1,
            }).execute()

        return {"success": True, "meal": result.data[0] if result.data else data}
    except Exception as e:
        print(f"Error creating manual meal: {e}")
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

# ---- GAMIFICATION ----

BADGES_CONFIG = [
    {"id": "first_scan", "name": "Premier Pas", "description": "Scannez votre premier repas", "icon": "📸", "color": "#4CAF50", "req_type": "scans", "req_value": 1},
    {"id": "scan_10", "name": "Photographe Culinaire", "description": "Scannez 10 repas", "icon": "🍽️", "color": "#2196F3", "req_type": "scans", "req_value": 10},
    {"id": "scan_50", "name": "Expert Scanner", "description": "Scannez 50 repas", "icon": "📷", "color": "#9C27B0", "req_type": "scans", "req_value": 50},
    {"id": "streak_3", "name": "Sur la Bonne Voie", "description": "3 jours consécutifs", "icon": "🔥", "color": "#FF5722", "req_type": "streak", "req_value": 3},
    {"id": "streak_7", "name": "Semaine Parfaite", "description": "7 jours consécutifs", "icon": "🌟", "color": "#FF9800", "req_type": "streak", "req_value": 7},
    {"id": "streak_30", "name": "Mois Légendaire", "description": "30 jours consécutifs", "icon": "💎", "color": "#FFD700", "req_type": "streak", "req_value": 30},
    {"id": "score_8", "name": "Mangeur Sain", "description": "Score moyen > 8 sur 10 repas", "icon": "🥇", "color": "#4CAF50", "req_type": "score_average", "req_value": 8},
    {"id": "calories_1000", "name": "Économiseur", "description": "10 repas sous les calories cibles", "icon": "💰", "color": "#2196F3", "req_type": "meals_under_goal", "req_value": 10},
]

def xp_for_score(score: int) -> int:
    if score >= 9: return 30
    if score >= 7: return 20
    if score >= 5: return 10
    return 5

def check_badge_unlocks(user_id: str, meals_count: int, streak: int, avg_score: float, meals_under_goal: int) -> list:
    """Return list of newly unlocked badge IDs"""
    existing = supabase.table("user_badges").select("badge_id").eq("user_id", user_id).execute()
    already_unlocked = {r["badge_id"] for r in (existing.data or [])}
    newly_unlocked = []

    for badge in BADGES_CONFIG:
        if badge["id"] in already_unlocked:
            continue
        req_type = badge["req_type"]
        req_value = badge["req_value"]
        unlocked = False
        if req_type == "scans" and meals_count >= req_value:
            unlocked = True
        elif req_type == "streak" and streak >= req_value:
            unlocked = True
        elif req_type == "score_average" and avg_score >= req_value:
            unlocked = True
        elif req_type == "meals_under_goal" and meals_under_goal >= req_value:
            unlocked = True
        if unlocked:
            supabase.table("user_badges").insert({
                "user_id": user_id,
                "badge_id": badge["id"],
                "unlocked_at": datetime.now().isoformat(),
            }).execute()
            newly_unlocked.append(badge["id"])

    return newly_unlocked

@app.get("/api/gamification/{user_id}")
async def get_gamification(user_id: str):
    """Get full gamification state for a user"""
    try:
        # Total XP from XP table
        xp_result = supabase.table("user_xp").select("total_xp").eq("user_id", user_id).execute()
        total_xp = xp_result.data[0]["total_xp"] if xp_result.data else 0

        # Meals count
        meals_result = supabase.table("meals").select("id, score").eq("user_id", user_id).execute()
        meals_data = meals_result.data or []
        meals_count = len(meals_data)
        avg_score = (sum(m["score"] for m in meals_data) / meals_count) if meals_count > 0 else 0.0

        # Streak
        streak_result = supabase.table("streaks").select("current_streak").eq("user_id", user_id).execute()
        current_streak = streak_result.data[0]["current_streak"] if streak_result.data else 0

        # Profile calories goal for meals_under_goal
        profile_result = supabase.table("profiles").select("daily_calories").eq("user_id", user_id).execute()
        daily_calories = profile_result.data[0]["daily_calories"] if profile_result.data else 2000

        # Daily stats to count meals under goal
        stats_result = supabase.table("daily_stats").select("total_calories").eq("user_id", user_id).execute()
        meals_under_goal = sum(1 for s in (stats_result.data or []) if s["total_calories"] <= daily_calories)

        # Check for new badges
        newly_unlocked = check_badge_unlocks(user_id, meals_count, current_streak, avg_score, meals_under_goal)

        # All unlocked badges
        badges_result = supabase.table("user_badges").select("badge_id, unlocked_at").eq("user_id", user_id).execute()
        unlocked_badge_ids = [r["badge_id"] for r in (badges_result.data or [])]

        return {
            "total_xp": total_xp,
            "meals_scanned": meals_count,
            "average_score": round(avg_score, 1),
            "unlocked_badge_ids": unlocked_badge_ids,
            "newly_unlocked_badge_ids": newly_unlocked,
        }
    except Exception as e:
        print(f"Error getting gamification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class AddXpRequest(BaseModel):
    user_id: str
    amount: int
    reason: str = ""

@app.post("/api/gamification/xp")
async def add_xp(req: AddXpRequest):
    """Add XP to a user"""
    try:
        existing = supabase.table("user_xp").select("*").eq("user_id", req.user_id).execute()
        if existing.data:
            current = existing.data[0]["total_xp"]
            supabase.table("user_xp").update({
                "total_xp": current + req.amount,
                "updated_at": datetime.now().isoformat(),
            }).eq("user_id", req.user_id).execute()
            new_total = current + req.amount
        else:
            supabase.table("user_xp").insert({
                "user_id": req.user_id,
                "total_xp": req.amount,
            }).execute()
            new_total = req.amount
        return {"success": True, "total_xp": new_total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/gamification/badges")
async def get_badges_config():
    """Return full badge configuration"""
    return {"badges": BADGES_CONFIG}

# ---- COACH IA (Claude API with user context) ----

class CoachMessage(BaseModel):
    user_id: str
    message: str
    history: List[dict] = []

@app.post("/api/coach/message")
async def coach_message(req: CoachMessage):
    """Send a message to the AI coach with user context"""
    try:
        # Fetch user context
        profile_result = supabase.table("profiles").select("*").eq("user_id", req.user_id).execute()
        profile = profile_result.data[0] if profile_result.data else {}

        meals_result = supabase.table("meals").select("foods, calories, score, created_at").eq("user_id", req.user_id).order("created_at", desc=True).limit(5).execute()
        recent_meals = meals_result.data or []

        streak_result = supabase.table("streaks").select("current_streak").eq("user_id", req.user_id).execute()
        current_streak = streak_result.data[0]["current_streak"] if streak_result.data else 0

        today = datetime.now().date().isoformat()
        stats_result = supabase.table("daily_stats").select("*").eq("user_id", req.user_id).eq("date", today).execute()
        today_stats = stats_result.data[0] if stats_result.data else {}

        goal_map = {"lose_weight": "perte de poids", "gain_muscle": "prise de muscle", "maintain": "maintien du poids"}
        goal_label = goal_map.get(profile.get("goal", "maintain"), "maintien du poids")

        language_instruction = get_language_prompt(profile.get("language", "fr"))

        recent_meals_text = ""
        if recent_meals:
            recent_meals_text = "\nRepas récents:\n" + "\n".join(
                f"- {', '.join(m['foods'][:3])} ({m['calories']} kcal, score {m['score']}/10)"
                for m in recent_meals[:3]
            )

        today_text = ""
        if today_stats:
            today_text = f"\nAujourd'hui: {today_stats.get('total_calories', 0)} kcal / {profile.get('daily_calories', 2000)} kcal cibles. {today_stats.get('meals_count', 0)} repas."

        system_prompt = f"""Tu es le coach nutrition personnel de {profile.get('first_name', "l'utilisateur")}.
Profil: {profile.get('age', '?')} ans, {profile.get('weight', '?')} kg, {profile.get('height', '?')} cm.
Objectif: {goal_label}. Calories cibles: {profile.get('daily_calories', 2000)} kcal/jour.
Série actuelle: {current_streak} jours.{today_text}{recent_meals_text}

Règles:
- Réponds de manière personnalisée, concise et motivante.
- Utilise le prénom si disponible.
- Base-toi sur les données réelles de l'utilisateur.
- Maximum 3-4 phrases par réponse.
{language_instruction}"""

        messages = []
        for h in req.history[-10:]:
            if h.get("role") in ("user", "assistant"):
                messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": req.message})

        response = claude_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=512,
            system=system_prompt,
            messages=messages,
        )

        return {"response": response.content[0].text}
    except Exception as e:
        print(f"Coach error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---- WEEKLY REPORT ----

@app.get("/api/stats/{user_id}/weekly-report")
async def get_weekly_report(user_id: str):
    """Generate a weekly nutrition summary"""
    try:
        from_date = (datetime.now() - timedelta(days=7)).date().isoformat()

        meals_result = supabase.table("meals").select("*").eq("user_id", user_id).gte("created_at", from_date).execute()
        meals = meals_result.data or []

        stats_result = supabase.table("daily_stats").select("*").eq("user_id", user_id).gte("date", from_date).execute()
        daily = stats_result.data or []

        streak_result = supabase.table("streaks").select("*").eq("user_id", user_id).execute()
        streak_data = streak_result.data[0] if streak_result.data else {}

        total_calories = sum(d.get("total_calories", 0) for d in daily)
        avg_score = (sum(m["score"] for m in meals) / len(meals)) if meals else 0
        active_days = len(set(d["date"] for d in daily))

        return {
            "week_start": from_date,
            "week_end": datetime.now().date().isoformat(),
            "total_meals": len(meals),
            "active_days": active_days,
            "total_calories": total_calories,
            "avg_daily_calories": round(total_calories / 7),
            "avg_score": round(avg_score, 1),
            "current_streak": streak_data.get("current_streak", 0),
            "longest_streak": streak_data.get("longest_streak", 0),
            "daily_stats": daily,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ════════════════════════════════════════════════════════════════════════════
#  EMAILS — WEBHOOK SUPABASE (nouvel utilisateur)
# ════════════════════════════════════════════════════════════════════════════

class SupabaseWebhookPayload(BaseModel):
    type: str           # INSERT / UPDATE / DELETE
    table: str
    record: dict
    old_record: Optional[dict] = None

@app.post("/api/webhooks/new-user")
async def webhook_new_user(payload: SupabaseWebhookPayload, background_tasks: BackgroundTasks):
    """
    Déclenché par Supabase quand un profil est créé (INSERT sur la table profiles).
    Envoie l'email de bienvenue en arrière-plan.
    """
    if payload.type != "INSERT" or payload.table != "profiles":
        return {"ok": True}

    record = payload.record
    user_id   = record.get("user_id")
    email     = record.get("email") or _get_user_email(user_id)
    first_name = record.get("first_name", "")

    if email:
        background_tasks.add_task(email_service.send_welcome_email, email, first_name)

    return {"ok": True, "email_queued": bool(email)}


def _get_user_email(user_id: str) -> Optional[str]:
    """Récupère l'email depuis auth.users via le service role."""
    try:
        res = supabase.auth.admin.get_user_by_id(user_id)
        return res.user.email if res and res.user else None
    except Exception:
        return None


# ════════════════════════════════════════════════════════════════════════════
#  EMAILS — ENDPOINT MANUEL (test / admin)
# ════════════════════════════════════════════════════════════════════════════

class SendEmailRequest(BaseModel):
    user_id: str
    email_type: str  # welcome | trial_ending_soon | trial_last_day | trial_expired | reengagement_3 | reengagement_7

@app.post("/api/emails/send")
async def send_email_manual(req: SendEmailRequest):
    """Endpoint admin pour envoyer un email manuellement (test ou trigger manuel)."""
    email = _get_user_email(req.user_id)
    if not email:
        raise HTTPException(status_code=404, detail="Email utilisateur introuvable")

    profile_res = supabase.table("profiles").select("first_name").eq("user_id", req.user_id).execute()
    first_name = profile_res.data[0].get("first_name", "") if profile_res.data else ""

    dispatch = {
        "welcome":             email_service.send_welcome_email,
        "trial_ending_soon":   email_service.send_trial_ending_soon,
        "trial_last_day":      email_service.send_trial_last_day,
        "trial_expired":       email_service.send_trial_expired,
        "reengagement_3":      email_service.send_reengagement_3days,
        "reengagement_7":      email_service.send_reengagement_7days,
    }

    fn = dispatch.get(req.email_type)
    if not fn:
        raise HTTPException(status_code=400, detail=f"Type inconnu: {req.email_type}")

    ok = fn(email, first_name)
    return {"success": ok, "to": email, "type": req.email_type}


# ════════════════════════════════════════════════════════════════════════════
#  SCHEDULER — Tâches quotidiennes automatiques
# ════════════════════════════════════════════════════════════════════════════

scheduler = AsyncIOScheduler(timezone="Europe/Paris")

async def _run_daily_email_jobs():
    """
    Tourne chaque jour à 10h00 Paris.
    Vérifie tous les utilisateurs et envoie les emails de séquence.
    """
    try:
        today = date.today()

        # Récupère tous les profils avec leur date de création
        profiles = supabase.table("profiles").select("user_id, first_name, created_at").execute()
        if not profiles.data:
            return

        for p in profiles.data:
            user_id    = p["user_id"]
            first_name = p.get("first_name", "")
            created_at = datetime.fromisoformat(p["created_at"].replace("Z", "+00:00")).date()
            days_since  = (today - created_at).days

            email = _get_user_email(user_id)
            if not email:
                continue

            # ── Séquence trial (7 jours) ────────────────────────────────
            if days_since == 5:
                email_service.send_trial_ending_soon(email, first_name)
            elif days_since == 6:
                email_service.send_trial_last_day(email, first_name)
            elif days_since == 8:
                email_service.send_trial_expired(email, first_name)

            # ── Réengagement (si inactif) ───────────────────────────────
            elif days_since in (3, 7):
                last_meal = supabase.table("meals")\
                    .select("created_at")\
                    .eq("user_id", user_id)\
                    .order("created_at", desc=True)\
                    .limit(1)\
                    .execute()

                if last_meal.data:
                    last_activity = datetime.fromisoformat(
                        last_meal.data[0]["created_at"].replace("Z", "+00:00")
                    ).date()
                    days_inactive = (today - last_activity).days
                    if days_inactive >= days_since:
                        if days_since == 3:
                            email_service.send_reengagement_3days(email, first_name)
                        else:
                            email_service.send_reengagement_7days(email, first_name)
                else:
                    # Aucun repas scanné — utilisateur jamais actif
                    if days_since == 3:
                        email_service.send_reengagement_3days(email, first_name)
                    elif days_since == 7:
                        email_service.send_reengagement_7days(email, first_name)

    except Exception as e:
        print(f"[SCHEDULER ERROR] daily_email_jobs: {e}")


@app.on_event("startup")
async def startup_event():
    scheduler.add_job(
        _run_daily_email_jobs,
        CronTrigger(hour=10, minute=0),
        id="daily_email_jobs",
        replace_existing=True,
    )
    scheduler.start()
    print("[SCHEDULER] Démarré — emails quotidiens à 10h00 Paris")


@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
