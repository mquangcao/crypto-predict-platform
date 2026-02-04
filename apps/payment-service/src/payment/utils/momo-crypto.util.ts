import * as crypto from 'crypto';

/**
 * Momo Crypto Utility
 * Handles HMAC SHA256 signing for Momo payment requests
 */
export class MomoCryptoUtil {
  /**
   * Create HMAC SHA256 signature
   */
  static createSignature(rawSignature: string, secretKey: string): string {
    return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
  }

  /**
   * Create raw signature for payment request
   */
  static createPaymentRawSignature(params: {
    accessKey: string;
    amount: string;
    extraData: string;
    ipnUrl: string;
    orderId: string;
    orderInfo: string;
    partnerCode: string;
    redirectUrl: string;
    requestId: string;
    requestType: string;
  }): string {
    return (
      `accessKey=${params.accessKey}` +
      `&amount=${params.amount}` +
      `&extraData=${params.extraData}` +
      `&ipnUrl=${params.ipnUrl}` +
      `&orderId=${params.orderId}` +
      `&orderInfo=${params.orderInfo}` +
      `&partnerCode=${params.partnerCode}` +
      `&redirectUrl=${params.redirectUrl}` +
      `&requestId=${params.requestId}` +
      `&requestType=${params.requestType}`
    );
  }

  /**
   * Verify Momo callback signature
   */
  static verifyCallbackSignature(
    signature: string,
    rawSignature: string,
    secretKey: string,
  ): boolean {
    const expectedSignature = this.createSignature(rawSignature, secretKey);
    return signature === expectedSignature;
  }

  /**
   * Create raw signature for callback verification
   */
  static createCallbackRawSignature(params: {
    accessKey: string;
    amount: string;
    extraData: string;
    message: string;
    orderId: string;
    orderInfo: string;
    orderType: string;
    partnerCode: string;
    payType: string;
    requestId: string;
    responseTime: string;
    resultCode: string;
    transId: string;
  }): string {
    return (
      `accessKey=${params.accessKey}` +
      `&amount=${params.amount}` +
      `&extraData=${params.extraData}` +
      `&message=${params.message}` +
      `&orderId=${params.orderId}` +
      `&orderInfo=${params.orderInfo}` +
      `&orderType=${params.orderType}` +
      `&partnerCode=${params.partnerCode}` +
      `&payType=${params.payType}` +
      `&requestId=${params.requestId}` +
      `&responseTime=${params.responseTime}` +
      `&resultCode=${params.resultCode}` +
      `&transId=${params.transId}`
    );
  }
}
