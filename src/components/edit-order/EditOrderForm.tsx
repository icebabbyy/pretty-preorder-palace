
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Order } from "@/types";

interface EditOrderFormProps {
  order: Order;
  username: string;
  setUsername: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  paymentDate: string;
  setPaymentDate: (value: string) => void;
  paymentSlip: string;
  setPaymentSlip: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

const EditOrderForm: React.FC<EditOrderFormProps> = ({
  username,
  setUsername,
  address,
  setAddress,
  paymentDate,
  setPaymentDate,
  paymentSlip,
  setPaymentSlip,
  status,
  setStatus,
}) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="username">Username *</Label>
      <Input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="ชื่อผู้ใช้"
        className="border border-purple-200 rounded-lg"
      />
    </div>
    <div>
      <Label htmlFor="address">ที่อยู่ *</Label>
      <Input
        id="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="ที่อยู่จัดส่ง"
        className="border border-purple-200 rounded-lg"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="paymentDate">วันที่ชำระเงิน</Label>
        <Input
          id="paymentDate"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="border border-purple-200 rounded-lg"
        />
      </div>
      <div>
        <Label htmlFor="paymentSlip">URL สลิปโอนเงิน</Label>
        <Input
          id="paymentSlip"
          value={paymentSlip}
          onChange={(e) => setPaymentSlip(e.target.value)}
          placeholder="https://..."
          className="border border-purple-200 rounded-lg"
        />
        {paymentSlip && (paymentSlip.startsWith("http://") || paymentSlip.startsWith("https://")) && (
          <div className="mt-2">
            <a href={paymentSlip} target="_blank" rel="noopener noreferrer">
              <img
                src={paymentSlip}
                alt="สลิปโอนเงิน"
                className="w-32 h-32 object-cover border rounded"
              />
            </a>
          </div>
        )}
      </div>
    </div>
    <div>
      <Label htmlFor="status">สถานะ</Label>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="border border-purple-200 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="รอชำระเงิน">รอชำระเงิน</SelectItem>
          <SelectItem value="รอโรงงานจัดส่ง">รอโรงงานจัดส่ง</SelectItem>
          <SelectItem value="กำลังมาไทย">กำลังมาไทย</SelectItem>
          <SelectItem value="จัดส่งแล้ว">จัดส่งแล้ว</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default EditOrderForm;
