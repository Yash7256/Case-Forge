from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML, CSS

from app.models.schemas import CaseStudy

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


def render_case_study_pdf(case: CaseStudy) -> bytes:
    template = env.get_template("case_study.html")
    html = template.render(case_study=case)
    pdf = HTML(
        string=html,
        base_url=str(TEMPLATES_DIR)
    ).write_pdf(
        stylesheets=[
            CSS(string="@page { size: A4; margin: 0; }")
        ]
    )
    return pdf