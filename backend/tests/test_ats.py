import pytest
from backend.app.services.entity_parser import parse_resume_entities, check_metrics_presence
from backend.app.services.ats_evaluator import evaluate_ats_score
from backend.app.services.session_manager import save_session, get_session

def test_entity_parser_skills_and_links():
    raw_text = (
        "John Doe\n"
        "Email: john.doe@email.com\n"
        "Github: github.com/johndoe-dev\n"
        "Linkedin: linkedin.com/in/johndoe-profile\n"
        "SKILLS\n"
        "Java, Python, Javascript, React, Docker, SQL, PostgreSQL, Kubernetes\n"
        "EXPERIENCE\n"
        "Worked 3 years of experience at TechCorp.\n"
        "PROJECTS\n"
        "Placement Portal: Created a portal, improved API load speed by 35%."
    )
    
    parsed = parse_resume_entities(raw_text)
    
    # Check contacts links are mapped
    assert "johndoe-dev" in parsed["contact"]["github"]
    assert "johndoe-profile" in parsed["contact"]["linkedin"]
    
    # Check languages and tools are extracted
    skills = parsed["technical_skills"]
    assert "Java" in skills["languages"]
    assert "Python" in skills["languages"]
    assert "React" in skills["frameworks"]
    assert "Docker" in skills["tools_cloud"]
    
    # Check experience mapping
    assert "Experienced" in parsed["experience_level"]
    
    # Check projects metrics parsing
    assert parsed["projects"][0]["has_metrics"] is True

def test_ats_evaluation_weights():
    parsed_profile = {
        "contact": {"github": "", "linkedin": ""},
        "technical_skills": {
            "languages": ["Java", "Python"],
            "frameworks": ["React"],
            "tools_cloud": ["Git"]
        },
        "projects": [
            {"title": "Proj 1", "technologies": ["React"], "has_metrics": True, "raw_text": "Reduced load time by 30%"}
        ],
        "experience_level": "Experienced (2-4 Years)",
        "education": [{"degree": "B.Tech", "year": "2026"}]
    }
    
    resume_text = "Java, Python, React, Git developer. Reduced load time by 30%."
    
    evaluation = evaluate_ats_score(resume_text, parsed_profile)
    summary = evaluation["summary"]
    
    assert "overall_score" in summary
    assert 0 <= summary["overall_score"] <= 100
    assert summary["quantifiable_impact_score"] == 92  # 1/1 projects have metrics

def test_session_manager_local_memory_fallback():
    session_id = "test_sess_123"
    payload = {"test": "data", "status": "active"}
    
    # Verify save & retrieve matches
    save_session(session_id, payload)
    retrieved = get_session(session_id)
    
    assert retrieved is not None
    assert retrieved["test"] == "data"
