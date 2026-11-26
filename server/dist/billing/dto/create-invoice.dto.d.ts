export declare class CreateInvoiceDto {
    memberId: string;
    subscriptionId?: string;
    planId?: string;
    amount: number;
    gstRate?: number;
    discount?: number;
    discountType?: string;
    lateFee?: number;
    paidAmount?: number;
    memberGstNumber?: string;
    memberPanNumber?: string;
    memberAddress?: string;
    notes?: string;
    paymentMethod?: string;
    dueDate: string;
    status: string;
}
