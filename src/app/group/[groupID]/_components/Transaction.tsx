"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import TransactionTableSkeleton from "./TransactionSkeleton";

interface ExpenseSplit {
  userName: string;
  amount: number;
  status: number;
}

interface Transaction {
  id: string;
  expenseId: string;
  amount: number;
  category: string;
  paidBy: string;
  description: string;
  date: string;
  status: number;
  PaidByName: string;
  splits: ExpenseSplit[];
}

const columns = [
  { id: "date", label: "Date", sortable: true },
  { id: "description", label: "Description", sortable: false },
  { id: "category", label: "Category", sortable: false },
  { id: "paidBy", label: "Paid By", sortable: false },
  { id: "amount", label: "Amount", sortable: true },
  { id: "status", label: "Status", sortable: false },
  { id: "action", label: "View split", sortable: false },
];

export default function Transaction({
  transactionsData,
  loading,
}: {
  transactionsData: Transaction[];
  loading: boolean;
}) {
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );
  const [showDetailed, setShowDetailed] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((col) => col.id)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);

  const handleSplitClick = (expenseId: string) => {
    setSelectedExpenseId((prevId) => (prevId === expenseId ? null : expenseId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredTransactions = useMemo(() => {
    if (!transactionsData) return [];
    let filtered = showDetailed
      ? transactionsData
      : transactionsData.filter((t) => t.status !== 3);

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (
          a[sortConfig.key as keyof Transaction] <
          b[sortConfig.key as keyof Transaction]
        ) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (
          a[sortConfig.key as keyof Transaction] >
          b[sortConfig.key as keyof Transaction]
        ) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [transactionsData, showDetailed, sortConfig]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return <TransactionTableSkeleton />;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto dark:border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Transactions
        </CardTitle>
        <div className="flex flex-row items-start sm:items-center justify-between mt-0 sm:mt-4 space-y-2 sm:space-y-0">
          <div className="flex mt-4 sm:mt-0 items-center text-center space-x-2 h-full">
            <Switch
              id="detailed-view"
              checked={showDetailed}
              onCheckedChange={setShowDetailed}
              className="items-center"
            />
            <label
              htmlFor="detailed-view"
              className="hidden sm:block text-sm font-medium text-muted-foreground items-center"
            >
              Show Cleared Transactions
            </label>
            <label
              htmlFor="detailed-view"
              className="text-sm block sm:hidden font-medium text-muted-foreground items-center"
            >
              Show
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(
                  (column) =>
                    selectedColumns.includes(column.id) && (
                      <TableHead
                        key={column.id}
                        className={`${
                          column.id === "amount" ? "text-right" : ""
                        }`}
                      >
                        {column.sortable ? (
                          <Button
                            variant="ghost"
                            onClick={() => requestSort(column.id)}
                            className={`flex items-center ${
                              column.id === "amount" ? "justify-end w-full" : ""
                            }`}
                          >
                            {column.label}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          column.label
                        )}
                      </TableHead>
                    )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
              {paginatedTransactions.length !== 0 &&
                paginatedTransactions.map((transaction) => (
                  <React.Fragment key={transaction.expenseId}>
                    <TableRow className="hover:bg-muted/50 transition-colors">
                      {selectedColumns.includes("date") && (
                        <TableCell className="font-medium">
                          {formatDate(transaction.date)}
                        </TableCell>
                      )}
                      {selectedColumns.includes("description") && (
                        <TableCell>
                          {transaction.description.length < 10
                            ? transaction.description
                            : transaction.description.slice(0, 9) + ".."}
                        </TableCell>
                      )}
                      {selectedColumns.includes("category") && (
                        <TableCell>{transaction.category}</TableCell>
                      )}
                      {selectedColumns.includes("paidBy") && (
                        <TableCell>{transaction.paidBy}</TableCell>
                      )}
                      {selectedColumns.includes("amount") && (
                        <TableCell className="text-right font-semibold">
                          {formatAmount(transaction.amount)}
                        </TableCell>
                      )}
                      {selectedColumns.includes("status") && (
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              transaction.status === 2
                                ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : transaction.status === 1
                                ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }`}
                          >
                            {transaction.status === 2
                              ? "Paid"
                              : transaction.status === 1
                              ? "Partially Paid"
                              : "Pending"}
                          </span>
                        </TableCell>
                      )}
                      {selectedColumns.includes("action") && (
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            onClick={() => handleSplitClick(transaction.id)}
                            className="items-center space-x-2"
                          >
                            <span>Split</span>
                            {selectedExpenseId === transaction.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                    {selectedExpenseId === transaction.id && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Array.isArray(transaction.splits) &&
                                transaction.splits.length > 0 ? (
                                  transaction.splits.map((split, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{split.userName}</TableCell>
                                      <TableCell className="text-right">
                                        {formatAmount(split.amount)}
                                      </TableCell>
                                      <TableCell>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            split.status === 2
                                              ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100"
                                              : split.status === 1
                                              ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                              : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
                                          }`}
                                        >
                                          {split.status === 2
                                            ? "Paid"
                                            : split.status === 1
                                            ? "Partially Paid"
                                            : "Pending"}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={3}
                                      className="text-center"
                                    >
                                      No splits available
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
