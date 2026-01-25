# Plan Service API Testing Guide

Base URL: `http://localhost:4006`

## 1. Get All Active Plans
```bash
curl -X GET http://localhost:4006/v1/plans
```

## 2. Get All Plans (including inactive)
```bash
curl -X GET http://localhost:4006/v1/plans/all
```

## 3. Get Plan by ID
```bash
curl -X GET http://localhost:4006/v1/plans/{plan-id}
```

## 4. Create New Plan - Standard (Free)
```bash
curl -X POST http://localhost:4006/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Standard",
    "description": "Foundational tools for market exploration.",
    "features": [
      "Real-time technical charts",
      "Market news aggregator",
      "Standard data latency",
      "Email support"
    ],
    "monthlyPrice": 0,
    "yearlyPrice": 0,
    "isPopular": false,
    "cta": "Get Started",
    "href": "/"
  }'
```

## 5. Create New Plan - VIP Premium
```bash
curl -X POST http://localhost:4006/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VIP Premium",
    "description": "Advanced intelligence for professional edge.",
    "features": [
      "Proprietary AI model analysis",
      "Actionable trade signals",
      "Advanced technical indicators",
      "Real-time price alerts",
      "Weekly market intelligence reports",
      "Zero-ads experience"
    ],
    "monthlyPrice": 36000,
    "yearlyPrice": 432000,
    "isPopular": true,
    "tag": "Recommended",
    "cta": "Go Premium",
    "href": "/checkout"
  }'
```

**Note:** Yearly price = Monthly price × 12. Để có giảm giá 20% cho yearly, dùng endpoint apply discount sau khi tạo plan.

## 6. Update Plan
```bash
curl -X PUT http://localhost:4006/v1/plans/{plan-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VIP Premium Plus",
    "monthlyPrice": 40000,
    "yearlyPrice": 400000
  }'
```

## 7. Apply Discount to Plan
```bash
curl -X PATCH http://localhost:4006/v1/plans/{plan-id}/discount \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyDiscountPrice": 30000,
    "yearlyDiscountPrice": 300000
  }'
```

## 8. Remove Discount from Plan
```bash
curl -X DELETE http://localhost:4006/v1/plans/{plan-id}/discount
```

## 9. Soft Delete Plan (Deactivate)
```bash
curl -X DELETE http://localhost:4006/v1/plans/{plan-id}
```

---

## PowerShell Examples (Windows)

### Get All Active Plans
```powershell
Invoke-RestMethod -Uri "http://localhost:4006/v1/plans" -Method Get
```

### Create Plan
```powershell
$body = @{
    name = "VIP Premium"
    description = "Advanced intelligence for professional edge."
    features = @(
        "Proprietary AI model analysis",
        "Actionable trade signals",
        "Advanced technical indicators"
    )
    monthlyPrice = 36000
    yearlyPrice = 432000  # 36000 × 12
    isPopular = $true
    tag = "Recommended"
    cta = "Go Premium"
    href = "/checkout"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4006/v1/plans" -Method Post -Body $body -ContentType "application/json"
```

### Apply Discount
```powershell
$planId = "your-plan-id-here"
$discount = @{
    monthlyDiscountPrice = 30000
    yearlyDiscountPrice = 300000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4006/v1/plans/$planId/discount" -Method Patch -Body $discount -ContentType "application/json"
```

---

## Testing Workflow

1. **Start the service**
   ```bash
   cd apps/plan-service
   npm run dev
   ```

2. **Check if service is running**
   ```bash
   curl http://localhost:4006/v1/plans
   ```

3. **The seeder will automatically create 2 default plans on first run**

4. **Test applying discount**
   - Get plan ID from step 2
   - Apply discount using PATCH endpoint
   - Verify discount is applied by fetching plans again

5. **Test from frontend**
   - Update your pricing page to fetch from `http://localhost:4006/v1/plans`
   - Display prices with discount logic
   - Show original price with strikethrough if discount exists

---

## Common Use Cases

### Scenario 1: Flash Sale (20% off yearly plans)
```bash
# Apply 20% discount to VIP Premium yearly plan
# Original yearly: 432,000 VND (36,000 × 12)
# With 20% discount: 345,600 VND
curl -X PATCH http://localhost:4006/v1/plans/{plan-id}/discount \
  -H "Content-Type: application/json" \
  -d '{
    "yearlyDiscountPrice": 345600
  }'
```

### Scenario 2: Remove Flash Sale
```bash
curl -X DELETE http://localhost:4006/v1/plans/{plan-id}/discount
```

### Scenario 3: Update Plan Features
```bash
curl -X PUT http://localhost:4006/v1/plans/{plan-id} \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      "Proprietary AI model analysis",
      "Actionable trade signals",
      "Advanced technical indicators",
      "Real-time price alerts",
      "Weekly market intelligence reports",
      "Zero-ads experience",
      "Priority customer support"
    ]
  }'
```

### Scenario 4: Temporarily Disable a Plan
```bash
curl -X DELETE http://localhost:4006/v1/plans/{plan-id}
```
