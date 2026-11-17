export type EcoStop = {
    desk_url_code?: string;
    name?: string;
    phone?: string | null;
    phone2?: string | null;
    code_wilaya?: number | null;
    wilaya?: string | null;
    commune?: string | null;
    adresse?: string | null;
    map?: string | null;
    /** Google Maps embed URL, or a full `<iframe …>` snippet pasted from Google Maps. */
    iframeMap?: string | null;
    lng?: "fr" | "ar" | string | null;
    hub_working_days?: { day: string; openTime: string; closeTime: string }[] | null;
    company :string| null

    // ── Order-level details (used by the HHD Express stopdesk page) ──
    /** Amount the customer pays at pickup, in DA. */
    order_price?: number | string | null;
    /** Sender (expéditeur) shown on the page. */
    sender_name?: string | null;
    sender_phone?: string | null;
    /** WhatsApp number of the sender if different from `sender_phone`. */
    sender_whatsapp?: string | null;
    tracking?: string | null;
  };
