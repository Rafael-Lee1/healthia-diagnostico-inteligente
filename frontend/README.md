# HealthIA Frontend

Frontend em React + Vite + TypeScript + TailwindCSS para consumir o backend FastAPI já existente do projeto HealthIA.

## Requisitos

- Node.js 20+
- Backend FastAPI rodando em `http://127.0.0.1:8000` (ou outra URL configurada em `.env`)

## Executar em desenvolvimento

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Build de produção

```bash
cd frontend
npm install
npm run build
npm run preview
```

## Variáveis de ambiente

- `VITE_API_BASE_URL`: URL base do backend FastAPI.

## Fluxo esperado do backend

- `GET /`
- `GET /predict/?sintomas=febre,cansaço,dor no corpo`

## Observação

A interface foi construída sem alterar o backend existente.
