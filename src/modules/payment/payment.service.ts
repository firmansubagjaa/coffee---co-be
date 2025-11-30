export class PaymentService {
  static async handleWebhook(data: any) {
    console.log("Payment Webhook Received:", data);
    // Add logic to update order status based on webhook data
    return { success: true };
  }
}
