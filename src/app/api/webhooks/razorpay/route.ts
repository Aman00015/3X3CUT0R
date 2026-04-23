import { type NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { sendWorkflowExecution } from "@/inngest/utils";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: workflowId" },
        { status: 400 },
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header" },
        { status: 401 },
      );
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { success: false, error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    // Verify HMAC SHA256 signature
    const expectedSignature = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    const body = JSON.parse(rawBody);

    // Only process payment.captured events
    if (body.event !== "payment.captured") {
      return NextResponse.json(
        { success: true, message: "Event ignored (not payment.captured)" },
        { status: 200 },
      );
    }

    const payment = body.payload?.payment?.entity ?? {};

    const razorpayData = {
      payment_id: payment.id ?? "",
      order_id: payment.order_id ?? "",
      amount: payment.amount ? payment.amount / 100 : 0, // Convert paise to rupees
      currency: payment.currency ?? "INR",
      customer_email: payment.email ?? "",
      customer_phone: payment.contact ?? "",
      customer_name: payment.notes?.name ?? payment.description ?? "",
      created_at: payment.created_at
        ? new Date(payment.created_at * 1000).toISOString()
        : new Date().toISOString(),
      raw: payment,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        razorpay: razorpayData,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Razorpay event" },
      { status: 500 },
    );
  }
}
