export interface SearchFilters {
  crop: string;
  location: string;
  quality: string;
  min_quantity: string;
  max_quantity: string;
  min_price: string;
  max_price: string;
}

export const emptyFilters: SearchFilters = {
  crop: "",
  location: "",
  quality: "",
  min_quantity: "",
  max_quantity: "",
  min_price: "",
  max_price: "",
};
