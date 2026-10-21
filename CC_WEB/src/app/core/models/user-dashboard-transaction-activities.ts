export interface UserDashboardTransaction {
  tnxId: string;
  transactionType: string;
  createdOn: string;
  expiryDate: string | null;
}

export interface UserDashboardResponse {
  recentCreated: UserDashboardTransaction[];
  recentExpired: UserDashboardTransaction[];
  calendarTransactions: UserDashboardTransaction[];
}
