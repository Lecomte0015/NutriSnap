"""
NutriSnap — Service Email avec Resend
Gère tous les emails transactionnels et les séquences marketing.
"""

import os
import resend
from datetime import datetime
from typing import Optional

resend.api_key = os.getenv("RESEND_API_KEY", "")

FROM_EMAIL = "NutriSnap <noreply@nutrisnap.app>"
REPLY_TO   = "support@nutrisnap.app"
APP_URL    = os.getenv("APP_URL", "https://nutrisnap.app")

# ─── Couleurs et constantes visuelles ──────────────────────────────────────
PRIMARY    = "#2fa4a7"
PRIMARY_DK = "#1d7a7d"
BG         = "#f4fffe"
CARD_BG    = "#ffffff"
TEXT_MAIN  = "#1a1a2e"
TEXT_GREY  = "#6b7280"

# ─── Base HTML commune ─────────────────────────────────────────────────────
def _wrap(body: str, preview: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>NutriSnap</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body{{margin:0;padding:0;background:{BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:{TEXT_MAIN};}}
    .wrapper{{max-width:600px;margin:0 auto;padding:32px 16px;}}
    .card{{background:{CARD_BG};border-radius:20px;padding:40px 36px;box-shadow:0 2px 20px rgba(0,0,0,.07);}}
    .logo-circle{{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,{PRIMARY},{PRIMARY_DK});display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;}}
    .logo-emoji{{font-size:32px;line-height:1;}}
    h1{{font-size:24px;font-weight:800;margin:0 0 8px;color:{TEXT_MAIN};letter-spacing:-.5px;}}
    h2{{font-size:19px;font-weight:700;margin:24px 0 8px;color:{TEXT_MAIN};}}
    p{{font-size:15px;line-height:1.7;color:{TEXT_GREY};margin:0 0 16px;}}
    .btn{{display:inline-block;background:linear-gradient(135deg,{PRIMARY},{PRIMARY_DK});color:#fff!important;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;margin:8px 0 20px;}}
    .pill{{display:inline-block;background:{PRIMARY}22;color:{PRIMARY};border-radius:100px;padding:4px 14px;font-size:13px;font-weight:600;margin-bottom:16px;}}
    .divider{{height:1px;background:#e5e7eb;margin:24px 0;}}
    .feature-row{{display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;}}
    .feature-icon{{font-size:20px;min-width:28px;}}
    .feature-text{{font-size:14px;color:{TEXT_GREY};line-height:1.5;}}
    .feature-text strong{{color:{TEXT_MAIN};}}
    .countdown{{background:linear-gradient(135deg,{PRIMARY}18,{PRIMARY}08);border:1.5px solid {PRIMARY}33;border-radius:14px;padding:20px 24px;text-align:center;margin:20px 0;}}
    .countdown-number{{font-size:48px;font-weight:900;color:{PRIMARY};line-height:1;}}
    .countdown-label{{font-size:13px;color:{TEXT_GREY};margin-top:4px;}}
    .warning{{background:#fff3cd;border:1.5px solid #ffc107;border-radius:12px;padding:16px 20px;margin:16px 0;}}
    .warning p{{color:#856404;margin:0;font-size:14px;}}
    .footer{{text-align:center;margin-top:28px;}}
    .footer p{{font-size:12px;color:#9ca3af;margin:4px 0;}}
    .footer a{{color:{PRIMARY};text-decoration:none;}}
  </style>
</head>
<body>
  {'<span style="display:none;max-height:0;overflow:hidden;">' + preview + '&nbsp;‌‌‌‌‌‌‌‌‌‌‌‌‌‌‌</span>' if preview else ''}
  <div class="wrapper">
    <div style="text-align:center;margin-bottom:24px;">
      <div class="logo-circle"><span class="logo-emoji">🥗</span></div>
    </div>
    <div class="card">
      {body}
    </div>
    <div class="footer">
      <p>© 2026 NutriSnap · Tous droits réservés</p>
      <p><a href="{APP_URL}/privacy.html">Confidentialité</a> · <a href="{APP_URL}/terms.html">CGU</a> · <a href="{{{{unsubscribe_url}}}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>"""


# ═══════════════════════════════════════════════════════════════════════════
#  1. EMAIL DE BIENVENUE (envoyé dès l'inscription)
# ═══════════════════════════════════════════════════════════════════════════
def send_welcome_email(to_email: str, first_name: str) -> bool:
    name = first_name or "là"
    body = f"""
      <span class="pill">✨ Bienvenue !</span>
      <h1>Salut {name}, tu es dans la place 🎉</h1>
      <p>Ton compte NutriSnap est prêt. Tu as <strong>7 jours Premium offerts</strong> pour explorer toutes les fonctionnalités sans limite.</p>

      <div class="divider"></div>
      <h2>Ce que tu peux faire maintenant</h2>

      <div class="feature-row">
        <span class="feature-icon">📸</span>
        <span class="feature-text"><strong>Prends en photo ton prochain repas</strong> — notre IA analyse les calories et macros en quelques secondes.</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">🏆</span>
        <span class="feature-text"><strong>Gagne des badges</strong> — débloque des récompenses en restant régulier dans ton suivi.</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">🤖</span>
        <span class="feature-text"><strong>Coach IA personnalisé</strong> — pose tes questions nutrition, reçois des conseils sur-mesure.</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">📊</span>
        <span class="feature-text"><strong>Dashboard complet</strong> — suis tes calories, protéines, glucides et lipides chaque jour.</span>
      </div>

      <div class="divider"></div>
      <div style="text-align:center;">
        <a href="{APP_URL}" class="btn">🚀 Commencer maintenant</a>
      </div>

      <p style="font-size:13px;color:#9ca3af;text-align:center;margin-top:8px;">
        Des questions ? Réponds directement à cet email, on est là pour toi.
      </p>
    """
    return _send(to_email, "Bienvenue sur NutriSnap 🥗 — Ton essai de 14 jours commence !", body,
                 preview=f"Salut {name} ! Ton essai Premium de 14 jours démarre maintenant.")


# ═══════════════════════════════════════════════════════════════════════════
#  2. RAPPEL J+5 — Plus que 2 jours
# ═══════════════════════════════════════════════════════════════════════════
def send_trial_ending_soon(to_email: str, first_name: str) -> bool:
    name = first_name or "toi"
    body = f"""
      <span class="pill">⏳ Essai Premium</span>
      <h1>Plus que 2 jours, {name} !</h1>
      <p>Ton essai gratuit de 7 jours se termine dans <strong>2 jours</strong>. Pour continuer à profiter de toutes les fonctionnalités, passe à Premium maintenant.</p>

      <div class="countdown">
        <div class="countdown-number">2</div>
        <div class="countdown-label">jours restants sur ton essai</div>
      </div>

      <h2>Ce que tu perdrais sans Premium</h2>
      <div class="feature-row">
        <span class="feature-icon">🤖</span>
        <span class="feature-text"><strong>Coach IA illimité</strong> — conseils personnalisés selon tes objectifs</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">📸</span>
        <span class="feature-text"><strong>Analyses illimitées</strong> — scanne autant de repas que tu veux</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">📈</span>
        <span class="feature-text"><strong>Statistiques avancées</strong> — historique complet et tendances</span>
      </div>

      <div style="text-align:center;margin-top:24px;">
        <a href="{APP_URL}" class="btn">💎 Continuer avec Premium</a>
      </div>
      <p style="font-size:13px;color:#9ca3af;text-align:center;">
        À partir de 4,99€/mois · Annulable à tout moment
      </p>
    """
    return _send(to_email, "⏳ Plus que 2 jours sur ton essai NutriSnap", body,
                 preview=f"Ton essai Premium se termine dans 2 jours — continue sans interruption !")


# ═══════════════════════════════════════════════════════════════════════════
#  3. RAPPEL J+6 — Dernier jour
# ═══════════════════════════════════════════════════════════════════════════
def send_trial_last_day(to_email: str, first_name: str) -> bool:
    name = first_name or "toi"
    body = f"""
      <span class="pill">🔔 Dernier jour</span>
      <h1>C'est le dernier jour, {name}</h1>
      <p>Ton essai Premium <strong>se termine aujourd'hui</strong>. Pour ne pas perdre l'accès à tes données et continuer ton suivi sans interruption, active Premium maintenant.</p>

      <div class="warning">
        <p>⚠️ <strong>Sans abonnement</strong>, tu perdras l'accès au Coach IA, aux analyses illimitées et à tes statistiques avancées dès demain.</p>
      </div>

      <div class="feature-row" style="margin-top:16px;">
        <span class="feature-icon">✅</span>
        <span class="feature-text"><strong>Tes données sont conservées</strong> — rien n'est supprimé, tu reprends là où tu en étais.</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">🔒</span>
        <span class="feature-text"><strong>Résiliation simple</strong> — annulable depuis l'app en 2 clics, sans engagement.</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">💰</span>
        <span class="feature-text"><strong>Dès 4,99€/mois</strong> — moins cher qu'un café par semaine.</span>
      </div>

      <div style="text-align:center;margin-top:24px;">
        <a href="{APP_URL}" class="btn">🔓 Activer Premium — 4,99€/mois</a>
      </div>
    """
    return _send(to_email, "🔔 Dernier jour de ton essai NutriSnap — Agis maintenant", body,
                 preview="C'est aujourd'hui le dernier jour ! Garde ton accès Premium.")


# ═══════════════════════════════════════════════════════════════════════════
#  4. RELANCE J+8 — Essai expiré
# ═══════════════════════════════════════════════════════════════════════════
def send_trial_expired(to_email: str, first_name: str) -> bool:
    name = first_name or "toi"
    body = f"""
      <span class="pill">💤 Essai terminé</span>
      <h1>Ton essai est terminé, {name}</h1>
      <p>Ton essai gratuit de 14 jours est arrivé à son terme. Mais la bonne nouvelle : <strong>toutes tes données sont sauvegardées</strong> et tu peux reprendre où tu en étais dès maintenant.</p>

      <div class="divider"></div>

      <p>Voici ce que disent nos utilisateurs Premium :</p>
      <div style="background:#f9fffe;border-left:3px solid {PRIMARY};padding:12px 16px;border-radius:0 10px 10px 0;margin:12px 0;">
        <p style="font-style:italic;margin:0;color:{TEXT_MAIN};">"J'ai perdu 6kg en 2 mois grâce à NutriSnap. Le Coach IA m'a vraiment aidé à comprendre mes habitudes."</p>
        <p style="font-size:12px;color:#9ca3af;margin:6px 0 0;">— Sarah M., utilisatrice Premium</p>
      </div>
      <div style="background:#f9fffe;border-left:3px solid {PRIMARY};padding:12px 16px;border-radius:0 10px 10px 0;margin:12px 0;">
        <p style="font-style:italic;margin:0;color:{TEXT_MAIN};">"Simple, rapide, efficace. Je prends ma photo et c'est tout. Je ne compte plus mes calories à la main."</p>
        <p style="font-size:12px;color:#9ca3af;margin:6px 0 0;">— Thomas K., utilisateur depuis 4 mois</p>
      </div>

      <div style="text-align:center;margin-top:24px;">
        <a href="{APP_URL}" class="btn">💎 Reprendre avec Premium</a>
      </div>
      <p style="font-size:13px;color:#9ca3af;text-align:center;">
        Offre spéciale : <strong>1er mois à 3,99€</strong> au lieu de 4,99€ · Code : <strong>RETOUR25</strong>
      </p>
    """
    return _send(to_email, "💎 Reprends ton parcours NutriSnap — Offre spéciale", body,
                 preview=f"Tes données t'attendent {name} ! 1er mois à 3,99€ avec RETOUR25.")


# ═══════════════════════════════════════════════════════════════════════════
#  5. RÉENGAGEMENT J+3 sans connexion
# ═══════════════════════════════════════════════════════════════════════════
def send_reengagement_3days(to_email: str, first_name: str) -> bool:
    name = first_name or "toi"
    body = f"""
      <span class="pill">👋 On pense à toi</span>
      <h1>Tu nous manques, {name} !</h1>
      <p>Ça fait 3 jours qu'on ne t'a pas vu. Ton streak nutritionnel t'attend — il suffit d'une photo de repas pour le relancer.</p>

      <div style="text-align:center;background:#f9fffe;border-radius:14px;padding:24px;margin:20px 0;">
        <div style="font-size:48px;">🔥</div>
        <p style="margin:8px 0 0;font-weight:700;color:{TEXT_MAIN};font-size:16px;">Relance ton streak aujourd'hui</p>
        <p style="margin:4px 0 0;font-size:13px;color:{TEXT_GREY};">La régularité, c'est 80% du succès</p>
      </div>

      <div class="feature-row">
        <span class="feature-icon">⚡</span>
        <span class="feature-text"><strong>30 secondes</strong> — prends une photo de ton prochain repas, l'IA fait le reste.</span>
      </div>
      <div class="feature-row">
        <span class="feature-icon">🎯</span>
        <span class="feature-text"><strong>Rappel</strong> — tu as encore {7 - 3} jours d'essai Premium à utiliser !</span>
      </div>

      <div style="text-align:center;margin-top:24px;">
        <a href="{APP_URL}" class="btn">📸 Analyser un repas maintenant</a>
      </div>
    """
    return _send(to_email, f"👋 {name}, ton streak NutriSnap t'attend !", body,
                 preview=f"3 jours sans check-in ! Reprends ton suivi en 30 secondes.")


# ═══════════════════════════════════════════════════════════════════════════
#  6. RÉENGAGEMENT J+7 sans connexion
# ═══════════════════════════════════════════════════════════════════════════
def send_reengagement_7days(to_email: str, first_name: str) -> bool:
    name = first_name or "toi"
    body = f"""
      <span class="pill">💬 Un message pour toi</span>
      <h1>Tout va bien, {name} ?</h1>
      <p>Ça fait une semaine qu'on ne t'a pas vu sur NutriSnap. On voulait juste s'assurer que tout va bien et te rappeler que l'application est là pour toi.</p>

      <p>Atteindre ses objectifs nutritionnels, c'est un marathon, pas un sprint. <strong>Même un petit pas compte.</strong></p>

      <div style="background:#f9fffe;border-radius:14px;padding:20px 24px;margin:20px 0;text-align:center;">
        <p style="font-size:15px;font-weight:700;color:{TEXT_MAIN};margin:0 0 8px;">🎁 On a quelque chose pour toi</p>
        <p style="font-size:13px;color:{TEXT_GREY};margin:0 0 12px;">Reviens aujourd'hui et débloque le badge <strong>"Retour en force"</strong> + 100 XP bonus.</p>
      </div>

      <div style="text-align:center;margin-top:16px;">
        <a href="{APP_URL}" class="btn">🚀 Revenir sur NutriSnap</a>
      </div>
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:12px;">
        Si tu as une question ou un problème, réponds à cet email. On te répond sous 24h.
      </p>
    """
    return _send(to_email, f"💬 {name}, tout va bien ?", body,
                 preview=f"Une semaine sans toi ! Un badge bonus t'attend si tu reviens cette semaine.")


# ═══════════════════════════════════════════════════════════════════════════
#  HELPER — Envoi via Resend
# ═══════════════════════════════════════════════════════════════════════════
def _send(to: str, subject: str, body_html: str, preview: str = "") -> bool:
    try:
        html = _wrap(body_html, preview)
        params: resend.Emails.SendParams = {
            "from": FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
            "reply_to": REPLY_TO,
        }
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {to} — {subject}: {e}")
        return False
