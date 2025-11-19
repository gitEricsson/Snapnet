export interface LeaveRequestedMsg {
  requestId: string;
  employeeId: string;
  startDate: string | Date;
  endDate: string | Date;
  attempts?: number;
}
