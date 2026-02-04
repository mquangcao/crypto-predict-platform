# Quick Test Script for Training Data Upload
# Run this after setting up AWS credentials in .env

Write-Host "🧪 Testing Training Data Upload to S3" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Check dataset stats
Write-Host "`n📊 Step 1: Checking dataset statistics..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:4004/training/stats" -Method Get
Write-Host "Total rows: $($stats.data.totalRows)" -ForegroundColor Green

if ($stats.data.symbolDistribution) {
    Write-Host "`nSymbol distribution:" -ForegroundColor Green
    $stats.data.symbolDistribution.PSObject.Properties | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Value)"
    }
}

if ($stats.data.dateRange) {
    Write-Host "`nDate range:" -ForegroundColor Green
    Write-Host "  From: $($stats.data.dateRange.min)"
    Write-Host "  To: $($stats.data.dateRange.max)"
}

# 2. Preview data
Write-Host "`n📋 Step 2: Previewing first 5 rows..." -ForegroundColor Yellow
$preview = Invoke-RestMethod -Uri "http://localhost:4004/training/preview?limit=5" -Method Get
Write-Host "Preview: $($preview.message)" -ForegroundColor Green

# 3. Upload to S3
Write-Host "`n📤 Step 3: Uploading to S3..." -ForegroundColor Yellow
Write-Host "This may take a few seconds..." -ForegroundColor Gray

try {
    $upload = Invoke-RestMethod -Uri "http://localhost:4004/training/upload" -Method Post
    
    if ($upload.success) {
        Write-Host "`n✅ Upload successful!" -ForegroundColor Green
        Write-Host "S3 URI: $($upload.s3Uri)" -ForegroundColor Cyan
        
        # Extract bucket and key from s3Uri
        if ($upload.s3Uri -match 's3://([^/]+)/(.+)') {
            $bucket = $matches[1]
            $key = $matches[2]
            
            Write-Host "`n📦 Verification command:" -ForegroundColor Yellow
            Write-Host "aws s3 ls s3://$bucket/$key" -ForegroundColor White
            
            Write-Host "`n💾 Download command:" -ForegroundColor Yellow
            Write-Host "aws s3 cp s3://$bucket/$key ./" -ForegroundColor White
        }
    } else {
        Write-Host "`n❌ Upload failed: $($upload.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error during upload:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check AWS credentials in .env file" -ForegroundColor White
    Write-Host "2. Verify S3 bucket exists: aws s3 ls s3://crypto-news-datalake-training/" -ForegroundColor White
    Write-Host "3. Check IAM permissions for S3 PutObject" -ForegroundColor White
}

Write-Host "`n" + "=" * 60
Write-Host "Test complete! Check TRAINING_DATA_UPLOAD_GUIDE.md for SageMaker setup." -ForegroundColor Cyan
