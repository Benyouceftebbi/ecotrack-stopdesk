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
    hub_working_days?: { day: string; openTime: string; closeTime: string }[] | null;
    company :string| null
  };