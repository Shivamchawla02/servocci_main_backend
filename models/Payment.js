import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order_id: { type: String, required: true },
  tracking_id: { type: String },
  bank_ref_no: { type: String },
  order_status: { type: String },
  failure_message: { type: String },
  payment_mode: { type: String },
  card_name: { type: String },
  currency: { type: String },
  amount: { type: String },
  billing_name: { type: String },
  billing_email: { type: String },
  billing_tel: { type: String },
  billing_address: { type: String },
  billing_city: { type: String },
  billing_state: { type: String },
  billing_zip: { type: String },
  billing_country: { type: String },
  status_message: { type: String },
  raw_response: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);
