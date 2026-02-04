/**
 * Momo API Payment Request (External API)
 */
export interface MomoApiPaymentRequest {
  partnerCode: string;
  partnerName: string;
  storeId: string;
  requestId: string;
  amount: string;
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  lang: string;
  requestType: string;
  autoCapture: boolean;
  extraData: string;
  orderGroupId: string;
  signature: string;
}

/**
 * Momo API Payment Response (External API)
 */
export interface MomoApiPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  applink?: string;
  deeplinkMiniApp?: string;
}

/**
 * Momo IPN Callback Data
 */
export interface MomoCallbackData {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: string;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

/**
 * Momo API Query Request (External API)
 */
export interface MomoApiQueryRequest {
  partnerCode: string;
  requestId: string;
  orderId: string;
  lang: string;
  signature: string;
}

/**
 * Momo API Query Response (External API)
 */
export interface MomoApiQueryResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  extraData: string;
  amount: number;
  transId: string;
  payType: string;
  resultCode: number;
  refundTrans: any[];
  message: string;
  responseTime: number;
}

/**
 * Momo Configuration
 */
export interface MomoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  apiEndpoint: string;
  ipnUrl: string;
  partnerName?: string;
  storeId?: string;
}
