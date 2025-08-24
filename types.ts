
export interface Loan {
  id: string;
  name: string;
  amount: number;
  description: string;
  date: Date;
}

export interface AggregatedLoan {
  name: string;
  totalAmount: number;
  loanCount: number;
}

export enum SortField {
  NAME = 'name',
  TOTAL_AMOUNT = 'totalAmount',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}
