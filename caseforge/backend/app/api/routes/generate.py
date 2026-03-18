from fastapi import APIRouter, HTTPException, Response

from app.models.schemas import CaseStudyResponse, GenerateRequest, PdfExportRequest, CaseStudy
from app.services.groq_service import generate_case_study
from app.services.pdf_service import render_case_study_pdf

router = APIRouter(tags=["generate"])


@router.post("/generate", response_model=CaseStudyResponse)
async def generate(request: GenerateRequest):
    try:
        case = await generate_case_study(request.session_id)
        return CaseStudyResponse(session_id=request.session_id, case_study=case)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/export/pdf")
async def export_pdf(case: PdfExportRequest):
    try:
        pdf_bytes = render_case_study_pdf(CaseStudy(**case.model_dump()))
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
