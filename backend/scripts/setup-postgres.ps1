# =============================================================================
# setup-postgres.ps1
# Script otomatis untuk install PostgreSQL, buat database, dan jalankan migrasi
# Jalankan dengan: .\scripts\setup-postgres.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

# ── Konfigurasi ──────────────────────────────────────────────────────────────
$PG_VERSION    = "16"
$PG_PASSWORD   = "postgres123"   # Password untuk user postgres
$DB_NAME       = "dof_db"
$PG_PORT       = "5432"
$PG_INSTALLER  = "$env:TEMP\postgresql-installer.exe"
$PG_INSTALL_DIR = "C:\Program Files\PostgreSQL\$PG_VERSION"
$PSQL          = "$PG_INSTALL_DIR\bin\psql.exe"
$DATABASE_URL  = "postgresql://postgres:$PG_PASSWORD@localhost:$PG_PORT/$DB_NAME"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " DOF Project — PostgreSQL Auto Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# ── Langkah 1: Cek apakah PostgreSQL sudah terinstall ────────────────────────
if (Test-Path $PSQL) {
    Write-Host "[1] PostgreSQL sudah terinstall di: $PG_INSTALL_DIR" -ForegroundColor Green
} else {
    Write-Host "[1] Mengunduh PostgreSQL $PG_VERSION installer..." -ForegroundColor Yellow
    $downloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-$PG_VERSION.6-1-windows-x64.exe"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $PG_INSTALLER -UseBasicParsing
        Write-Host "    Download selesai." -ForegroundColor Green
    } catch {
        Write-Host "    Gagal download otomatis. Silakan download manual dari:" -ForegroundColor Red
        Write-Host "    https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
        Write-Host "    Lalu jalankan script ini lagi." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "[1] Menginstall PostgreSQL (ini mungkin 2-3 menit)..." -ForegroundColor Yellow
    $args = @(
        "--mode", "unattended",
        "--unattendedmodeui", "none",
        "--superpassword", $PG_PASSWORD,
        "--serverport", $PG_PORT,
        "--prefix", $PG_INSTALL_DIR,
        "--datadir", "$PG_INSTALL_DIR\data"
    )
    Start-Process -FilePath $PG_INSTALLER -ArgumentList $args -Wait -NoNewWindow
    Write-Host "    PostgreSQL terinstall." -ForegroundColor Green
}

# ── Langkah 2: Tambahkan pg bin ke PATH sesi ini ─────────────────────────────
$pgBin = "$PG_INSTALL_DIR\bin"
if ($env:PATH -notlike "*$pgBin*") {
    $env:PATH = "$pgBin;$env:PATH"
}

# ── Langkah 3: Pastikan service PostgreSQL berjalan ──────────────────────────
Write-Host "[2] Memastikan service PostgreSQL berjalan..." -ForegroundColor Yellow
$svc = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($svc) {
    if ($svc.Status -ne "Running") {
        Start-Service $svc.Name
        Start-Sleep -Seconds 3
    }
    Write-Host "    Service '$($svc.Name)' berjalan." -ForegroundColor Green
} else {
    Write-Host "    Service PostgreSQL tidak ditemukan, mencoba pg_ctl..." -ForegroundColor Yellow
    & "$pgBin\pg_ctl" start -D "$PG_INSTALL_DIR\data" 2>$null
    Start-Sleep -Seconds 3
    Write-Host "    PostgreSQL dijalankan." -ForegroundColor Green
}

# ── Langkah 4: Buat database dof_db ──────────────────────────────────────────
Write-Host "[3] Membuat database '$DB_NAME'..." -ForegroundColor Yellow
$env:PGPASSWORD = $PG_PASSWORD
$exists = & $PSQL -U postgres -p $PG_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>$null
if ($exists -eq "1") {
    Write-Host "    Database '$DB_NAME' sudah ada." -ForegroundColor Green
} else {
    & $PSQL -U postgres -p $PG_PORT -c "CREATE DATABASE $DB_NAME;" 2>$null
    Write-Host "    Database '$DB_NAME' berhasil dibuat." -ForegroundColor Green
}

# ── Langkah 5: Update .env ────────────────────────────────────────────────────
Write-Host "[4] Mengupdate .env dengan DATABASE_URL..." -ForegroundColor Yellow
$envFile = Join-Path $PSScriptRoot "..\\.env"
$envContent = Get-Content $envFile -Raw
$envContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=`"$DATABASE_URL`""
Set-Content $envFile $envContent -NoNewline
Write-Host "    .env diupdate: DATABASE_URL=$DATABASE_URL" -ForegroundColor Green

# ── Langkah 6: Generate Prisma Client + Prisma Migrate ───────────────────────
Write-Host "[5] Menjalankan Prisma migrate..." -ForegroundColor Yellow
Set-Location (Split-Path $PSScriptRoot -Parent)
$env:DATABASE_URL = $DATABASE_URL

try {
    & npx prisma migrate deploy 2>&1
    Write-Host "    Prisma migrate selesai." -ForegroundColor Green
} catch {
    Write-Host "    Mencoba 'prisma migrate dev'..." -ForegroundColor Yellow
    & npx prisma migrate dev --name init 2>&1
}

# ── Langkah 7: Generate Prisma Client ────────────────────────────────────────
Write-Host "[6] Generate Prisma Client..." -ForegroundColor Yellow
& npx prisma generate 2>&1
Write-Host "    Prisma Client siap." -ForegroundColor Green

# ── Selesai ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host " SETUP SELESAI!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host " Database  : $DB_NAME" -ForegroundColor White
Write-Host " Host      : localhost:$PG_PORT" -ForegroundColor White
Write-Host " User      : postgres" -ForegroundColor White
Write-Host " Password  : $PG_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host " Sekarang jalankan aplikasi:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host " Untuk migrasi data dari SQLite:" -ForegroundColor Cyan
Write-Host "   npm run migrate:pg" -ForegroundColor White
Write-Host ""
