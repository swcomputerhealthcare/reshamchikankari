export interface ShiprocketAuthResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_id: number;
  token: string;
  created_at: string;
}

export interface ShiprocketOrderItemInput {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

export interface CreateShiprocketOrderPayload {
  order_id: string;
  order_date: string; // YYYY-MM-DD HH:mm
  pickup_location: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItemInput[];
  payment_method: "Prepaid" | "COD";
  shipping_charges: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount?: number;
  sub_total: number;
  length: number; // in cm
  breadth: number; // in cm
  height: number; // in cm
  weight: number; // in kg (e.g. 0.5)
}

export interface CreateShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now?: number;
  awb_code?: string;
  courier_company_id?: string;
  courier_name?: string;
  new_channel?: boolean;
}

export interface ServiceabilityCourier {
  courier_company_id: number;
  courier_name: string;
  min_weight: number;
  rate: number;
  cod_charges: number;
  estimated_delivery_days: string;
  etd: string;
  is_surface: boolean;
  rating: number;
}

export interface ServiceabilityResponse {
  status: number;
  data: {
    available_courier_companies: ServiceabilityCourier[];
    recommended_courier_company_id?: number;
  };
}

export interface AssignAWBPayload {
  shipment_id: number | string;
  courier_id?: number | string;
  status?: string;
}

export interface AssignAWBResponse {
  status: number;
  awb_assign_status: number;
  response: {
    data: {
      courier_company_id: number;
      awb_code: string;
      courier_name: string;
      child_courier_name?: string;
      shipment_id: number;
      order_id: number;
      pickup_scheduled_date?: string;
      applied_weight?: number;
      company_name?: string;
      tracking_url?: string;
    };
  };
}

export interface GeneratePickupPayload {
  shipment_id: (number | string)[];
}

export interface GeneratePickupResponse {
  status: number;
  response: {
    pickup_status: number;
    response: {
      pickup_scheduled_date: string;
      pickup_token_number: string;
      status: string;
    };
  };
}

export interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  sr_status_label?: string;
}

export interface TrackingResponse {
  tracking_data: {
    track_status: number;
    shipment_status: number;
    shipment_track: Array<{
      id: number;
      awb_code: string;
      courier_name: string;
      current_status: string;
      origin: string;
      destination: string;
      pickup_date: string;
      delivered_date: string;
      weight: string;
      packages: number;
    }>;
    shipment_track_activities: TrackingActivity[];
    track_url?: string;
  };
}

export type InternalFulfillmentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPMENT_CREATED"
  | "AWB_ASSIGNED"
  | "PICKUP_SCHEDULED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RTO"
  | "EXCEPTION";
