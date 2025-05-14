import requests
import json
import time

def get_user_input(rletTpCd, tradTpCd, zoom_level, lat, lon):
    """
    API 요청 파라미터를 생성합니다.
    """
    return {
        "rletTpCd": rletTpCd,
        "tradTpCd": tradTpCd,
        "z": zoom_level,
        "lat": lat,
        "lon": lon,
        "btm": str(float(lat) - 0.0008),
        "lft": str(float(lon) - 0.0008),
        "top": str(float(lat) + 0.0008),
        "rgt": str(float(lon) + 0.0008),
        "showR0": "",
        "cortarNo": "",
        "page": 1
    }

def scrape_real_estate(rletTpCd, tradTpCd, zoom_level, lat, lon):
    base_url = "https://m.land.naver.com/cluster/ajax/articleList"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
    }

    all_articles = []  # 모든 매물 정보를 저장할 리스트
    params = get_user_input(rletTpCd, tradTpCd, zoom_level, lat, lon)

    try:
        print("[INFO] 매물 데이터 요청 시작...")

        while True:
            response = requests.get(base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            articles = data.get("body", [])

            if not articles:
                print("[INFO] 모든 매물 정보를 가져왔습니다.")
                break

            for article in articles:
                article_data = {
                    "매물 번호": article.get("atclNo", "정보 없음"),
                    "매물 이름": article.get("atclNm", "정보 없음"),
                    "층 정보": article.get("flrInfo", "정보 없음"),
                    "가격 (단위: 만 원)": article.get("hanPrc", "정보 없음"),
                    "면적 (m²)": article.get("spc2", "정보 없음"),
                    "방향": article.get("direction", "정보 없음"),
                    "특징 설명": article.get("atclFetrDesc", "정보 없음"),
                    "태그": ", ".join(article.get("tagList", [])),
                    "중개업소": article.get("rltrNm", "정보 없음"),
                    "거래 유형": article.get("tradTpNm", "정보 없음"),
                    "매물 상태": "판매 중" if article.get("atclStatCd") == "R0" else "판매 완료"
                }
                all_articles.append(article_data)

            print(f"[INFO] 페이지 {params['page']} 완료, 총 {len(all_articles)}개 매물 수집 중...")

            params["page"] += 1
            time.sleep(1)

        print(f"[INFO] 총 {len(all_articles)}개의 매물 정보를 수집 완료.")
        return all_articles

    except requests.exceptions.HTTPError as http_err:
        print(f"[ERROR] HTTP 오류 발생: {http_err}")
        raise
    except requests.exceptions.RequestException as req_err:
        print(f"[ERROR] 요청 오류 발생: {req_err}")
        raise
    except json.JSONDecodeError as json_err:
        print(f"[ERROR] JSON 파싱 오류: {json_err}")
        raise
    except Exception as e:
        print(f"[ERROR] 오류 발생: {e}")
        raise
