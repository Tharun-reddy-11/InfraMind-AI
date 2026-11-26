# InfraMind AI

Infrastructure monitoring and coordinated maintenance platform. The system is composed of a React/Vite web client, a Spring Boot REST API with JWT authorization and MySQL persistence, and a FastAPI ML service. It has no seeded operational users or fabricated analytics: a fresh database is intentionally empty until authorized users create records.

## Start locally

1. Copy `.env.example` to `.env` and replace every password and `JWT_SECRET`.
2. Start MySQL, API, ML service, and the web client with `docker compose up --build`.
3. Open `http://localhost:5173`, create a Citizen account, then have an administrator provision operational roles through the Admin dashboard/API.

For development, run `npm install && npm run dev` in `frontend`, `mvn spring-boot:run` in `backend`, and `python -m venv .venv; .venv\\Scripts\\pip install -r requirements.txt; uvicorn app.main:app --reload --port 8000` in `ml-service`. Java 21+ and Python 3.11–3.13 are currently recommended; Python 3.14 compatibility for the deep-learning stack should be verified before installation.

## Dataset inventory

`Datasets/*26.xlsx` (53 workbooks) are state-level bridge inventory exports, suitable for bridge asset import and supervised risk-model feature exploration. `2025IN_ElementData.xml` and `2025NY_ElementData.xml` are bridge element condition data. `RoadDamageDetector-master` supplies source, labels and documentation for RDD road-damage work, but no local training images or frozen model. `DATA_Maguire_20180517_ALL/SDNET2018.zip` is a concrete crack image archive described as 56,092 labeled 256px images, suitable for structural-defect classification after extraction.

Run `ml-service/scripts/audit_datasets.py` after installing its requirements for exact workbook sheet/column/row metrics. Run `ml-service/scripts/train_bridge_model.py` to produce the optional `artifacts/bridge_risk.joblib`; the inference API deliberately returns `MODEL_NOT_READY` until that artifact exists. This avoids presenting a heuristic as a safety prediction.

## API and security

Swagger is at `/swagger-ui.html`; health is `/actuator/health`. Public routes are registration, login, ML health and weather. Public registration can only create `CITIZEN` accounts. Privileged roles are provisioned by an `ADMIN`; server-side policies protect every write. Configure mail before enabling password resets—there is no pretend email flow.

## External data

Weather uses Open-Meteo's public forecast endpoint at request time and returns its provider/timestamp. The UI identifies unavailable ML models and failed external calls instead of inventing data.
