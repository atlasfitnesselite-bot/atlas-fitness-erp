import api from '../../../lib/api';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Receipt, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BillingTab = ({ member }) => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("token") || '';
        const res = await api.get(`/api/members/${member.id}/invoices`);
        if (res.data) {
          const data = res.data;
          setInvoices(data || []);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (member?.id) {
      fetchInvoices();
    }
  }, [member?.id]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading billing history...</div>;
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Billing History</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            This member does not have any invoices or payment history on record.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.id.substring(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                <TableCell>
                  {invoice.status === 'PAID' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">PAID</Badge>
                  ) : invoice.status === 'PENDING' ? (
                    <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">PENDING</Badge>
                  ) : (
                    <Badge variant="outline" className="text-destructive border-destructive/30">{invoice.status}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invoice.paymentMethod || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BillingTab;
