# Plan Service

Service quản lý các gói subscription (monthly/yearly) cho crypto platform.

## Tính năng

- ✅ Lấy danh sách các gói đang hoạt động
- ✅ Lấy tất cả các gói (bao gồm cả inactive)
- ✅ Lấy chi tiết một gói theo ID
- ✅ Tạo gói mới
- ✅ Cập nhật thông tin gói
- ✅ Áp dụng giảm giá cho gói (monthly/yearly)
- ✅ Xóa giảm giá
- ✅ Soft delete gói (đánh dấu isActive = false)

## Logic Giá

### Cách tính giá cơ bản:
- **Monthly Price**: Giá gốc hàng tháng (VD: 36,000 VND)
- **Yearly Price**: Monthly Price × 12 (VD: 36,000 × 12 = 432,000 VND)

### Giảm giá:
- **Monthly Discount Price**: Giá giảm cho gói tháng (optional)
- **Yearly Discount Price**: Giá giảm cho gói năm (optional)

### Ví dụ thực tế:
```
Gói VIP Premium:
├─ monthlyPrice: 36,000 VND
├─ yearlyPrice: 432,000 VND (36,000 × 12)
├─ yearlyDiscountPrice: 345,600 VND (giảm 20% = 432,000 × 0.8)
└─ Tiết kiệm: 86,400 VND khi mua yearly
```

### Hiển thị giá trên Frontend:
```typescript
// Luôn ưu tiên giá discount nếu có
const displayPrice = isYearly 
  ? (plan.yearlyDiscountPrice || plan.yearlyPrice)
  : (plan.monthlyDiscountPrice || plan.monthlyPrice);
```

## API Endpoints

### 1. Lấy tất cả gói đang hoạt động
```http
GET /v1/plans
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Standard",
      "description": "Foundational tools for market exploration.",
      "features": ["Real-time charts", "Market news"],
      "monthlyPrice": 0,
      "yearlyPrice": 0,
      "monthlyDiscountPrice": null,
      "yearlyDiscountPrice": null,
      "isPopular": false,
      "tag": null,
      "cta": "Get Started",
      "href": "/",
      "isActive": true
    }
  ]
}
```

### 2. Lấy tất cả gói (bao gồm inactive)
```http
GET /v1/plans/all
```

### 3. Lấy chi tiết gói theo ID
```http
GET /v1/plans/:id
```

### 4. Tạo gói mới
```http
POST /v1/plans
Content-Type: application/json

{
  "name": "VIP Premium",
  "description": "Advanced intelligence for professional edge.",
  "features": [
    "Proprietary AI model analysis",
    "Actionable trade signals",
    "Advanced technical indicators"
  ],
  "monthlyPrice": 36000,
  "yearlyPrice": 360000,
  "isPopular": true,
  "tag": "Recommended",
  "cta": "Go Premium",
  "href": "/checkout"
}
```

### 5. Cập nhật gói
```http
PUT /v1/plans/:id
Content-Type: application/json

{
  "name": "VIP Premium Plus",
  "monthlyPrice": 40000,
  "yearlyPrice": 400000
}
```

### 6. Áp dụng giảm giá
```http
PATCH /v1/plans/:id/discount
Content-Type: application/json

{
  "monthlyDiscountPrice": 30000,
  "yearlyDiscountPrice": 300000
}
```

### 7. Xóa giảm giá
```http
DELETE /v1/plans/:id/discount
```

### 8. Soft delete gói
```http
DELETE /v1/plans/:id
```

## Database Schema

```typescript
{
  id: string (UUID)
  name: string
  description: string
  features: string[]
  monthlyPrice: number (decimal 12,2)
  yearlyPrice: number (decimal 12,2)
  monthlyDiscountPrice: number | null (decimal 12,2)
  yearlyDiscountPrice: number | null (decimal 12,2)
  isPopular: boolean
  tag: string | null
  cta: string
  href: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Cách sử dụng từ Frontend

```typescript
// Fetch active plans
const response = await fetch('http://localhost:4006/v1/plans');
const { data } = await response.json();

// Tính giá hiển thị (ưu tiên giá giảm nếu có)
const displayPrice = (plan, isYearly) => {
  if (isYearly) {
    return plan.yearlyDiscountPrice || plan.yearlyPrice;
  }
  return plan.monthlyDiscountPrice || plan.monthlyPrice;
};

// Kiểm tra có giảm giá không
const hasDiscount = (plan, isYearly) => {
  if (isYearly) {
    return plan.yearlyDiscountPrice !== null;
  }
  return plan.monthlyDiscountPrice !== null;
};
```

## Chạy service

```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

## Port

- Development: `4006`
- Gateway TCP: `8006`

## Dependencies

- NestJS
- TypeORM
- PostgreSQL
- class-validator
- class-transformer
