export type SearchStatus = "new" | "in_progress" | "completed" | "closed";

export type AdminSearchRequest = {
  id: number;
  user_id: number;
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string | null;
  cabin?: string | null;
  passengers: number;
  notes?: string | null;
  admin_notes?: string | null;
  status: SearchStatus;
  created_at: string;
  updated_at: string;
  user_email?: string | null;
  user?: {
    email?: string | null;
    full_name?: string | null;
  } | null;
  itinerary_options?: ItineraryOption[];
};

export type ItineraryOption = {
  id: number;
  search_request_id: number;
  carrier: string;
  flight_numbers: string;
  departure_time: string;
  arrival_time: string;
  cabin?: string | null;
  cash_price?: number | null;
  points_price?: number | null;
  taxes_and_fees?: number | null;
  booking_instructions?: string | null;
  source: string;
  created_at?: string;
  updated_at?: string;
};
