# Sincronización automática de correos

Este documento explica cómo programar la sincronización automática que llama al endpoint seguro `/api/emails/sync-all`.

1) Variables de entorno necesarias
- `SYNC_SECRET`: valor secreto que protege el endpoint. Debe ser una cadena larga y aleatoria.
- `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL` — ya requeridas por la app.

2) Generar un valor seguro para `SYNC_SECRET`
- Linux / macOS:
  ```bash
  openssl rand -hex 32
  ```
- Windows PowerShell:
  ```powershell
  # Genera 32 bytes en hex
  [System.BitConverter]::ToString((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32)).Replace('-', '').ToLower()
  ```

3) Local: añadir a `.env.local`
```
SYNC_SECRET=tu_valor_generado
```

4) GitHub Actions (opcional): crear secret en el repositorio
- Repo → Settings → Secrets and variables → Actions → New repository secret
- Nombre: `SYNC_SECRET`
- Valor: mismo `tu_valor_generado`

5) Workflow de ejemplo
- Archivo: `.github/workflows/sync-emails.yml`
- El workflow usa `secrets.SYNC_SECRET` para enviar el header `x-sync-secret`.

6) Probar localmente
- Inicia servidor:
  ```powershell
  npm run dev
  ```
- Ejecuta (PowerShell):
  ```powershell
  Invoke-RestMethod -Uri http://localhost:3000/api/emails/sync-all -Method Post -Headers @{ 'x-sync-secret' = 'tu_valor_generado' }
  ```

7) Programar en producción
- En Vercel: añade `SYNC_SECRET` en Environment Variables y programa un cron job que haga POST al endpoint con `x-sync-secret`.
- En GitHub Actions: el workflow incluido hará la llamada si configuras el secret.

8) Notas de escalabilidad
- `importUserGmail` por defecto trae hasta 1000 mensajes por cuenta; si tienes muchas cuentas y bandejas muy grandes, considera usar `historyId` incremental o procesamientos asíncronos por lotes.
