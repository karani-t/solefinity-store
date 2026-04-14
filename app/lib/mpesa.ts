/**
 * M-Pesa Daraja API Integration for Kenya
 * Handles STK Push and payment callbacks
 * 
 * Setup:
 * 1. Register at: https://developer.safaricom.co.ke/
 * 2. Create an app and get Credentials
 * 3. Add these to your .env file:
 *    MPESA_CONSUMER_KEY=your_consumer_key
 *    MPESA_CONSUMER_SECRET=your_consumer_secret
 *    MPESA_PASS_KEY=your_pass_key
 *    MPESA_SHORT_CODE=your_short_code
 *    MPESA_CALLBACK_URL=your_callback_url
 */

interface DarajaTokenResponse {
  access_token: string;
  expires_in: string;
}

interface MpesaSTKPushPayload {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

interface MpesaSTKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export class MpesaService {
  private consumerKey = process.env.MPESA_CONSUMER_KEY || "";
  private consumerSecret = process.env.MPESA_CONSUMER_SECRET || "";
  private passKey = process.env.MPESA_PASS_KEY || "";
  private shortCode = process.env.MPESA_SHORT_CODE || "174379";
  private callbackUrl = process.env.MPESA_CALLBACK_URL || "";

  // Development/Testing environment
  private isDev = process.env.NODE_ENV === "development";
  private baseUrl = this.isDev
    ? "https://sandbox.safaricom.co.ke"
    : "https://api.safaricom.co.ke";

  /**
   * Generate access token for Daraja API
   */
  async getAccessToken(): Promise<string> {
    // For development, return mock token
    if (this.isDev) {
      console.log("📱 [DEV] Using mock M-Pesa token");
      return "mock-token-" + Date.now();
    }

    try {
      const auth = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`
      ).toString("base64");

      const response = await fetch(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      const data: DarajaTokenResponse = await response.json();

      if (!response.ok) {
        throw new Error("Failed to get M-Pesa access token");
      }

      return data.access_token;
    } catch (error) {
      console.error("Error getting M-Pesa access token:", error);
      throw error;
    }
  }

  /**
   * Generate timestamp in format YYYYMMDDHHmmss
   */
  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}${month}${date}${hours}${minutes}${seconds}`;
  }

  /**
   * Generate password for M-Pesa (Base64 encoded)
   */
  private generatePassword(timestamp: string): string {
    const str = `${this.shortCode}${this.passKey}${timestamp}`;
    return Buffer.from(str).toString("base64");
  }

  /**
   * Normalize phone number to 254xxxxxxxxx format
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, "");

    // If starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    }
    // If doesn't start with 254, add it
    else if (!cleaned.startsWith("254")) {
      cleaned = "254" + cleaned;
    }

    return cleaned;
  }

  /**
   * Initiate STK Push (popup payment prompt on customer's phone)
   */
  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    orderId: string,
    description: string = "Order Payment"
  ): Promise<{
    success: boolean;
    checkoutRequestId?: string;
    merchantRequestId?: string;
    message: string;
    error?: string;
  }> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // For development, simulate STK push
      if (this.isDev) {
        console.log("📱 [DEV] Simulating M-Pesa STK Push:", {
          phone: normalizedPhone,
          amount,
          orderId,
        });

        return {
          success: true,
          checkoutRequestId: `DEV-${orderId}-${Date.now()}`,
          merchantRequestId: `DEV-MERCHANT-${Date.now()}`,
          message: "[DEVELOPMENT] M-Pesa payment prompt will appear on " + normalizedPhone,
        };
      }

      const payload: MpesaSTKPushPayload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: normalizedPhone,
        PartyB: this.shortCode,
        PhoneNumber: normalizedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: orderId,
        TransactionDesc: description,
      };

      const token = await this.getAccessToken();

      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data: MpesaSTKPushResponse = await response.json();

      if (data.ResponseCode === "0") {
        return {
          success: true,
          checkoutRequestId: data.CheckoutRequestID,
          merchantRequestId: data.MerchantRequestID,
          message: data.CustomerMessage,
        };
      } else {
        return {
          success: false,
          message: data.ResponseDescription,
          error: data.ResponseDescription,
        };
      }
    } catch (error) {
      console.error("Error initiating STK push:", error);
      return {
        success: false,
        message: "Failed to initiate payment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Query STK Push status
   */
  async queryStkStatus(
    checkoutRequestId: string
  ): Promise<{
    ResultCode: string;
    ResultDesc: string;
  }> {
    try {
      // For development, return mock response
      if (this.isDev) {
        console.log("📱 [DEV] Querying mock M-Pesa status for:", checkoutRequestId);
        return {
          ResultCode: "0",
          ResultDesc: "[DEVELOPMENT] Payment completed successfully",
        };
      }

      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const token = await this.getAccessToken();

      const payload = {
        BusinessShortCode: this.shortCode,
        CheckoutRequestID: checkoutRequestId,
        Password: password,
        Timestamp: timestamp,
      };

      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      return response.json();
    } catch (error) {
      console.error("Error querying STK status:", error);
      throw error;
    }
  }

  /**
   * Validate M-Pesa callback signature (for production)
   */
  validateCallbackSignature(
    callbackBody: any,
    signature: string,
    timestamp: string
  ): boolean {
    // This would validate the signature using the public key from Safaricom
    // For now, we'll just log it
    console.log("📱 M-Pesa Callback Received:", {
      time: timestamp,
      body: callbackBody,
    });
    return true;
  }
}

export const mpesaService = new MpesaService();