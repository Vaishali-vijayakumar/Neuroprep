import re
import numpy as np
from typing import Dict, List, Any

# Lazy-loaded model instance
model = None

def get_sentence_transformer():
    """
    Loads sentence-transformers model lazily.
    Supports multi-tier fallbacks: all-mpnet-base-v2 -> all-MiniLM-L6-v2 -> TF-IDF Fallback
    """
    global model
    if model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Primary target
            model = SentenceTransformer('all-mpnet-base-v2')
        except Exception as e:
            print(f"[ATS Evaluator] Could not load all-mpnet-base-v2 ({str(e)}). Falling back to MiniLM...")
            try:
                from sentence_transformers import SentenceTransformer
                # Secondary lightweight target (~90MB)
                model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception:
                print("[ATS Evaluator] Sentence-Transformers unavailable. Initializing Jaccard-Sim fallbacks.")
                model = "jaccard"
    return model

def calculate_cosine_similarity(text1: str, text2: str) -> int:
    """Computes similarity index between two texts."""
    transformer = get_sentence_transformer()
    
    if transformer == "jaccard":
        # Pure string keyword intersection fallback
        w1 = set(re.findall(r"\b\w+\b", text1.lower()))
        w2 = set(re.findall(r"\b\w+\b", text2.lower()))
        intersection = w1.intersection(w2)
        union = w1.union(w2)
        sim = len(intersection) / len(union) if union else 0.5
        # Scale to match typical cosine similarity distributions
        scaled_sim = 40 + int(sim * 60)
        return min(100, max(0, scaled_sim))
    else:
        try:
            emb1 = transformer.encode(text1)
            emb2 = transformer.encode(text2)
            
            dot = np.dot(emb1, emb2)
            n1 = np.linalg.norm(emb1)
            n2 = np.linalg.norm(emb2)
            
            cos_sim = dot / (n1 * n2) if (n1 * n2) > 0 else 0.5
            # Scale -1..1 to 0..100%
            percent_sim = int((cos_sim + 1) / 2 * 100)
            return min(100, max(0, percent_sim))
        except Exception:
            # Fallback if computation error
            return 75

ROLE_BENCHMARKS = {
    "frontend developer": (
        "frontend developer engineer web UI UX design react angular vue javascript typescript html css "
        "next.js tailwind jquery frontend user interface graphics responsiveness DOM webpack git"
    ),
    "backend engineer": (
        "backend developer engineer java python golang c++ spring boot express fastapi django flask node.js "
        "microservices sql postgresql mysql mongodb databases api restful graphql redis caching rabbitmq kafka docker"
    ),
    "fullstack developer": (
        "fullstack engineer developer backend frontend java python javascript typescript html css react node "
        "spring boot express sql postgresql mongodb databases git docker cloud api full-stack web"
    ),
    "data scientist / ai engineer": (
        "data scientist machine learning ai artificial intelligence engineer python r pandas numpy scikit-learn "
        "tensorflow pytorch neural networks statistics deep learning databases sql data modeling nlp data analysis math"
    ),
    "devops & cloud engineer": (
        "devops cloud systems engineer automation terraform ansible jenkins ci/cd pipelines aws docker kubernetes "
        "gcp azure scripting bash linux scaling networks security server virtualization systems"
    )
}

ROLE_KEYWORDS = {
    "frontend developer": ["TypeScript", "Tailwind CSS", "Next.js", "GraphQL", "Auto-testing", "Webpack", "Redux Toolkit", "Sass"],
    "backend engineer": ["Redis Caching", "Kafka Streams", "Docker Setup", "Kubernetes", "API Security", "PostgreSQL", "GraphQL", "CI/CD Setup"],
    "fullstack developer": ["Cloud Setup", "Caching", "Auto-testing", "TypeScript", "AWS Hosting", "GraphQL", "Kubernetes", "CI/CD Setup"],
    "data scientist / ai engineer": ["TensorFlow", "PyTorch", "scikit-learn", "SQL Querying", "Pandas DataFrames", "Docker", "Model Tuning", "MLOps"],
    "devops & cloud engineer": ["Kubernetes", "Terraform IaC", "Jenkins CI/CD", "Ansible Playbooks", "AWS Hosting", "Docker", "Linux Shell", "Prometheus"]
}

def evaluate_ats_score(resume_text: str, parsed_profile: Dict[str, Any], target_role: str = "Fullstack Developer") -> Dict[str, Any]:
    """
    Evaluates raw resume text against target placement profile.
    Computes keyword alignment (40%), quantifiable impact (30%), formatting & readability (30%).
    """
    lower_resume = resume_text.lower()
    normalized_role = target_role.lower().strip()
    
    # 1. Resolve semantic comparison profile base
    target_profile = ROLE_BENCHMARKS.get("fullstack developer")
    for role_key, profile_text in ROLE_BENCHMARKS.items():
        if role_key in normalized_role or normalized_role in role_key:
            target_profile = profile_text
            break
            
    if not target_profile or target_profile == ROLE_BENCHMARKS.get("fullstack developer"):
        if normalized_role not in ["fullstack developer", "fullstack", "developer"]:
            target_profile = f"software engineer developer {normalized_role} coding programming technical computer science"

    # Compute semantic cosine similarity against target profile
    semantic_sim = calculate_cosine_similarity(resume_text, target_profile)
    
    # Factor in unique count of identified skills
    skills_count = len(parsed_profile["technical_skills"]["languages"]) + \
                   len(parsed_profile["technical_skills"]["frameworks"]) + \
                   len(parsed_profile["technical_skills"]["tools_cloud"])
    keyword_score = int(semantic_sim * 0.7 + min(30, skills_count * 2.5))
    keyword_alignment_score = min(100, max(40, keyword_score))
    
    # 2. Quantifiable Impact score (30%)
    projects = parsed_profile["projects"]
    metrics_count = sum(1 for p in projects if p["has_metrics"])
    ratio = metrics_count / len(projects) if projects else 0
    
    if ratio >= 0.8:
        quantifiable_impact_score = 92
    elif ratio >= 0.5:
        quantifiable_impact_score = 80
    elif ratio >= 0.2:
        quantifiable_impact_score = 68
    else:
        quantifiable_impact_score = 52
        
    # 3. Formatting & Readability score (30%)
    layout_score = 85
    if len(resume_text) > 800:
        layout_score += 10
    else:
        layout_score -= 20
        
    sections = ["experience", "education", "skills", "project"]
    found_sections = sum(1 for s in sections if s in lower_resume)
    layout_score += (found_sections * 2) - 4
    formatting_readability_score = min(98, max(40, layout_score))
    
    overall_score = int(
        (keyword_alignment_score * 0.4) +
        (quantifiable_impact_score * 0.3) +
        (formatting_readability_score * 0.3)
    )
    
    # Resolve dynamic keywords matching based on target role
    all_keywords_list = ROLE_KEYWORDS.get("fullstack developer")
    for role_key, kw_list in ROLE_KEYWORDS.items():
        if role_key in normalized_role or normalized_role in role_key:
            all_keywords_list = kw_list
            break
            
    current_skills = set(
        s.lower() for s in 
        (parsed_profile["technical_skills"]["languages"] + 
         parsed_profile["technical_skills"]["frameworks"] + 
         parsed_profile["technical_skills"]["tools_cloud"])
    )
    
    missing_high_priority_keywords = [
        kw for kw in all_keywords_list if kw.lower() not in current_skills
    ][:5]
    
    # Strong domains checks
    detected_strong_domains = []
    if any(s in ["react", "html", "css", "javascript"] for s in current_skills):
        detected_strong_domains.append("Frontend Web Design")
    if any(s in ["node.js", "express", "django", "spring boot", "fastapi"] for s in current_skills):
        detected_strong_domains.append("API Creation")
    if any(s in ["sql", "postgresql", "mongodb", "redis"] for s in current_skills):
        detected_strong_domains.append("Database Setup")
    if not detected_strong_domains:
        detected_strong_domains.append("General Coding")
        
    actionable_resume_improvements = []
    if quantifiable_impact_score < 75:
        actionable_resume_improvements.append(
            "Try adding some simple numbers to your projects! For example, tell us how many people used your app, or how much faster it became after your changes."
        )
    else:
        actionable_resume_improvements.append(
            "Great job adding numbers! To make it even stronger, connect each number to what you specifically did (e.g. 'Reduced loading time by 20% by optimization')."
        )
        
    has_cloud = any(s in ["aws", "docker", "kubernetes", "gcp", "azure"] for s in current_skills)
    if not has_cloud:
        actionable_resume_improvements.append(
            "Adding a mention of how you shared your project online (like hosting it on GitHub Pages, Netlify, or AWS) is a great way to show practical skills."
        )
    else:
        actionable_resume_improvements.append(
            "You mentioned cloud hosting. Adding how you automate testing or deployment (using GitHub Actions, for example) shows excellent workflow skills!"
        )
        
    return {
        "summary": {
            "overall_score": overall_score,
            "keyword_alignment_score": keyword_alignment_score,
            "quantifiable_impact_score": quantifiable_impact_score,
            "formatting_readability_score": formatting_readability_score
        },
        "insights": {
            "missing_high_priority_keywords": missing_high_priority_keywords,
            "detected_strong_domains": detected_strong_domains,
            "actionable_resume_improvements": actionable_resume_improvements
        }
    }
