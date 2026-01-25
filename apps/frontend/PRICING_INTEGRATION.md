# Frontend Integration Summary - Pricing Page

## ✅ Đã hoàn thành

### 1. **Created DTOs/Schemas** (`apps/frontend/src/api/dtos/plan.ts`)

- `PlanSchema` - Zod schema cho Plan object
- `PlansResponseSchema` - Schema cho API response (list of plans)
- `PlanResponseSchema` - Schema cho single plan response
- Type exports: `Plan`, `PlansResponse`, `PlanResponse`

### 2. **Created Custom Hook** (`apps/frontend/src/hooks/api/plan.ts`)

- `useGetPlans()` - React Query hook để fetch plans từ API
- Sử dụng `createGetQueryHook` helper
- Auto caching và refetching với React Query

### 3. **Updated Pricing Page** (`apps/frontend/src/app/pricing/page.tsx`)

- ✅ Replaced hardcoded plans với API call
- ✅ Added loading state (spinner)
- ✅ Added error state
- ✅ Display price với discount logic:
  - Hiển thị giá gốc với line-through nếu có discount
  - Ưu tiên discount price nếu có
- ✅ Format giá theo VN locale (36,000 thay vì 36000)
- ✅ Dynamic period text (per month/per year)
- ✅ Pass planId vào checkout URL

## 📊 Pricing Logic

```typescript
// Get display price (ưu tiên discount)
const displayPrice = isYearly
  ? (plan.yearlyDiscountPrice ?? plan.yearlyPrice)
  : (plan.monthlyDiscountPrice ?? plan.monthlyPrice);

// Check if has discount
const hasDiscount = isYearly
  ? plan.yearlyDiscountPrice !== null
  : plan.monthlyDiscountPrice !== null;

// Format price
const formatted = new Intl.NumberFormat("vi-VN").format(price);
```

## 🎨 UI States

### Loading State

```tsx
{
  isLoading && (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}
```

### Error State

```tsx
{
  error && (
    <div className="text-center py-20">
      <p className="text-red-600 font-medium">Failed to load pricing plans</p>
      <p className="text-slate-500 text-sm mt-2">Please try again later</p>
    </div>
  );
}
```

### Discount Display

```tsx
{
  hasDiscount(plan) && (
    <span className="text-xl font-bold text-slate-400 line-through">
      {formatPrice(getOriginalPrice(plan))}
    </span>
  );
}
<span className="text-5xl md:text-6xl font-black tracking-tighter text-slate-950">
  {formatPrice(getDisplayPrice(plan))}
</span>;
```

## 🔗 API Endpoint

**Endpoint:** `GET /plans`  
**Base URL:** Configured in `apps/frontend/src/api/axios.ts`

**Expected Response:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "name": "VIP Premium",
      "description": "...",
      "features": ["..."],
      "monthlyPrice": 36000,
      "yearlyPrice": 432000,
      "monthlyDiscountPrice": null,
      "yearlyDiscountPrice": 345600,
      "isPopular": true,
      "tag": "Recommended",
      "cta": "Go Premium",
      "href": "/checkout",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

## 🚀 How It Works

1. **Component mounts** → `useGetPlans()` hook triggers API call
2. **React Query** caches response và manages loading/error states
3. **Data arrives** → Plans are displayed with proper formatting
4. **User toggles monthly/yearly** → Prices update reactively
5. **Discount logic** → Automatically shows discounted price if available

## 📝 Key Features

- ✅ **Type-safe** - Full TypeScript support với Zod validation
- ✅ **Cached** - React Query caches API responses
- ✅ **Loading states** - Spinner while fetching
- ✅ **Error handling** - User-friendly error messages
- ✅ **Discount support** - Shows original + discounted prices
- ✅ **VN formatting** - Prices formatted theo locale Việt Nam
- ✅ **Dynamic URLs** - Checkout URL includes planId và period

## 🔄 React Query Benefits

1. **Auto caching** - Không fetch lại nếu data đã có
2. **Background refetch** - Auto update khi user quay lại tab
3. **Stale-while-revalidate** - Show cached data while fetching fresh
4. **Error retry** - Auto retry failed requests
5. **Devtools** - React Query Devtools để debug

## ⚠️ Note về ESLint Errors

Các lint errors về `tsconfigRootDir` là do ESLint config trong monorepo. Không ảnh hưởng đến functionality. Có thể fix bằng cách update `eslint.config.js` nhưng không cần thiết cho việc chạy app.

## 🧪 Testing

### Manual Test Steps:

1. Start plan-service: `cd apps/plan-service && npm run dev`
2. Start frontend: `cd apps/frontend && npm run dev`
3. Navigate to `/pricing`
4. Verify:
   - Plans load from API
   - Loading spinner shows initially
   - Prices format correctly
   - Toggle monthly/yearly works
   - Discount prices show with strikethrough
   - CTA buttons link correctly

### Expected Behavior:

- **Initial load**: Spinner → Plans appear
- **Monthly**: Shows monthly prices
- **Yearly**: Shows yearly prices (with discount if available)
- **Discount**: Original price crossed out, discount price prominent
- **Free plan**: Shows "0 VND" without period text

---

**Created:** 2026-01-25  
**Pattern:** Following same architecture as login/auth hooks  
**Status:** ✅ Complete and ready to test
