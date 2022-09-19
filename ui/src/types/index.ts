export type TMap = Record<any, any>;

// Model
export type TModelState = {
  dic: Record<string, any>;
  list: any[];
  current?: string;
};

export type TSearchQuery = {
  keyword?: string;
  except?: string[];
  page?: number;
  limit?: number;
}