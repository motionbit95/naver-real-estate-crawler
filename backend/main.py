import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # Static 파일 제공
from pydantic import BaseModel
from utils.scraper import scrape_real_estate
from utils.excel_handler import save_to_excel

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # React 앱 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📌 'static' 폴더가 없으면 자동 생성
STATIC_DIR = "static"
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

# 'static' 폴더를 정적 파일 제공 경로로 설정
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class CrawlRequest(BaseModel):
    rletTpCd: str
    tradTpCd: str
    zoom_level: str
    lat: str
    lon: str

@app.post("/crawl")
def crawl_real_estate(data: CrawlRequest):
    try:
        # 매물 정보를 크롤링
        listings = scrape_real_estate(
            rletTpCd=data.rletTpCd,
            tradTpCd=data.tradTpCd,
            zoom_level=data.zoom_level,
            lat=data.lat,
            lon=data.lon
        )

        # 파일을 'static' 폴더에 저장
        file_name = save_to_excel(listings)
        file_path = os.path.join(file_name)

        return {
            "message": "크롤링 완료!",
            "listings": listings,
            "file_url": f"/{file_path}"  # 프론트에서 접근할 수 있도록 URL 반환
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"크롤링 오류 발생: {str(e)}")
