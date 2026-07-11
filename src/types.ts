export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "resident" | "guard" | "admin" | "super_admin";
  flat?: string;
  type?: string; // Owner or Tenant
  vehicleNo?: string;
  shift?: string; // For guards
  gate?: string;  // For guards
  idCard?: string; // For guards
  designation?: string; // For admins
  committee?: string; // For admins
  organization?: string; // For super admin
}

export interface Visitor {
  id: string;
  name: string;
  type: "Guest" | "Delivery" | "Cab" | "Service";
  purpose: string;
  flat: string;
  hostName: string;
  company: string;
  vehicleNumber: string;
  passcode: string;
  qrCode: string;
  status: "Pre-Approved" | "Checked-In" | "Checked-Out";
  requestedAt: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  phone?: string;
  gateName?: string;
  validDate?: string;
  validTime?: string;
  expiryTime?: string;
}

export interface MaintenanceBill {
  id: string;
  flat: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Unpaid";
  category: string;
  paidAt: string | null;
  transactionId: string | null;
}

export interface ComplaintUpdate {
  date: string;
  note: string;
}

export interface Complaint {
  id: string;
  flat: string;
  residentName: string;
  title: string;
  category: string;
  description: string;
  status: "Pending" | "Assigned" | "Resolved";
  createdAt: string;
  assignedTo: string | null;
  updates: ComplaintUpdate[];
}

export interface Notice {
  id: string;
  title: string;
  category: string;
  content: string;
  date: string;
  author: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  flat: string;
  message: string;
  timestamp: string;
}

export interface Amenity {
  id: string;
  name: string;
  capacity: number;
  costPerHour: number;
  description: string;
}

export interface AmenityBooking {
  id: string;
  amenityId: string;
  amenityName: string;
  residentName: string;
  flat: string;
  date: string;
  timeSlot: string;
  cost: number;
  status: string;
}

export interface StaffMember {
  id: string;
  name: string;
  type: string;
  phone: string;
  rating: number;
  flats: string;
  status: "Checked-In" | "Checked-Out";
  checkedInAt: string;
  checkedOutAt?: string;
  code: string;
}

export interface ParkingSpot {
  id: string;
  slotNumber: string;
  flat: string;
  owner: string;
  vehicleNumber: string;
  vehicleType: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  votedUsers: string[];
  totalVotes: number;
  endsAt: string;
}

export interface GuardAlert {
  id: string;
  sender: string;
  type: string;
  message: string;
  timestamp: string;
  status: "Active" | "Resolved";
}
