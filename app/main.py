from fastapi import FastAPI

from app.api.routes import api_router

app = FastAPI(title="MilesMapped")

app.include_router(api_router)


@app.get("/", include_in_schema=False)
def read_root() -> dict[str, str]:
    return {"message": "MilesMapped API"}
