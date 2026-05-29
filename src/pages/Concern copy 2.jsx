import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { onMessage } from "firebase/messaging";
import { messaging } from "../notifications/firebase";

import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, X } from "lucide-react";

export default function Concern() {
  const [concerns, setConcerns] = useState([]);
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // FETCH
  // =========================
  const fetchConcerns = async (pageNum = 1) => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/concerns?page=${pageNum}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to load concerns");
        return;
      }

      setConcerns(data.data || []);
      setPage(data.current_page);
      setLastPage(data.last_page);
    } catch {
      toast.error("Server error");
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchConcerns(1);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
      const unsubscribe = onMessage(messaging, () => {
        fetchConcerns(page, search);
      });
  
      return () => unsubscribe();
    }, [page, search]);

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!confirm("Delete this concern?")) return;

    const res = await fetch(
      `https://ajcpisonet.com/api/concerns/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (res.ok) {
      toast.success("Deleted");
      fetchConcerns(page);
    }
  };

  // =========================
  // STATUS
  // =========================
  const updateStatus = async (id, status) => {
    const res = await fetch(
      `https://ajcpisonet.com/api/concerns/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (res.ok) {
      toast.success("Updated");
      setSelected(null);
      fetchConcerns(page);
    }
  };

  // =========================
  // PAGINATION CLICK
  // =========================
  const goToPage = (p) => {
    if (p < 1 || p > lastPage) return;

    setPage(p);
    fetchConcerns(p);
  };
  return (
    <div className="w-full">
      <div className="mb-5 flex items-center gap-2 w-full max-w-sm relative">
        <Search className="absolute left-3 h-4 w-4 text-zinc-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search concerns..."
          className="
            h-10
            w-full
            rounded-xl
            border
            border-zinc-200
            bg-white
            pl-10
            pr-10
            text-sm
            text-zinc-800
            outline-none
            transition
            placeholder:text-zinc-400
            focus:border-zinc-300
            focus:ring-4
            focus:ring-zinc-100
          "
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 text-zinc-400 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
 
      {/* TABLE CARD */}
      <div className="rounded-xl border border-zinc-500 bg-white shadow-sm overflow-hidden">
        <Table className="w-full text-sm">

          {/* HEADER */}
          <TableHeader className="bg-white">
            <TableRow className="border-b border-zinc-200">
              <TableHead className="text-xs font-medium text-blue-600">
                #
              </TableHead>

              <TableHead className="text-xs font-medium text-blue-600">
                Submitted By
              </TableHead>

              <TableHead className="text-xs font-medium text-blue-600">
                Concern
              </TableHead>

              <TableHead className="text-xs font-medium text-blue-600">
                Location
              </TableHead>

              <TableHead className="text-xs font-medium text-blue-600">
                Status
              </TableHead>

              <TableHead className="text-xs font-medium text-blue-600">
                Date
              </TableHead>

              <TableHead className="text-right text-xs font-medium text-blue-600">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody>
            {concerns.map((item, index) => (
              <TableRow
                key={item.id}
                className="border-b border-zinc-100 hover:bg-zinc-50 transition"
              >

                {/* # */}
                <TableCell className="text-zinc-500">
                  {(page - 1) * 10 + index + 1}
                </TableCell>

                {/* USER */}
                <TableCell className="font-medium text-zinc-900">
                  {item.user?.full_name || "Unknown"}
                </TableCell>

                {/* CONCERN */}
                <TableCell className="text-zinc-700">
                  {item.title}
                </TableCell>

                {/* LOCATION */}
                <TableCell className="text-zinc-600">
                  {item.location}
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      item.status === "resolved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : item.status === "rejected"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : item.status === "in_progress"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : item.status === "under_review"
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "bg-zinc-50 text-zinc-600 border-zinc-200"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </TableCell>

                {/* DATE */}
                <TableCell className="text-zinc-500 text-xs">
                  {new Date(item.created_at).toLocaleDateString("en-PH")}
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    
                    <button
                      onClick={() => setSelected(item)}
                      className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600"
                    >
                      👁️
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(item.id, "resolved")
                      }
                      className="p-1.5 rounded hover:bg-green-50 text-green-600"
                    >
                      ✔
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                    >
                      🗑
                    </button>

                  </div>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>

        </Table>
      </div>

      {/* PAGINATION (LIKE SHADCN DEMO) */}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => goToPage(page - 1)}
            />
          </PaginationItem>

          {[...Array(lastPage)].map((_, i) => {
            const p = i + 1;

            return (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => goToPage(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* DIALOG */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
              </DialogHeader>

              <div className="text-sm space-y-2">
                <p>{selected.description}</p>

                <p>
                  <strong>Submitted by:</strong>{" "}
                  {selected.user?.full_name}
                </p>

                <p>
                  <strong>Location:</strong> {selected.location}
                </p>
              </div>

              <DialogFooter className="flex justify-between items-center">
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      Current: {selected.status}
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      disabled={selected.status === "received"}
                      onClick={() => updateStatus(selected.id, "received")}
                    >
                      📨 Received
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={selected.status === "under_review"}
                      onClick={() => updateStatus(selected.id, "under_review")}
                    >
                      🔍 Under Review
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={selected.status === "in_progress"}
                      onClick={() => updateStatus(selected.id, "in_progress")}
                    >
                      ⚙️ In Progress
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={selected.status === "resolved"}
                      onClick={() => updateStatus(selected.id, "resolved")}
                      className="text-green-600"
                    >
                      ✅ Resolved
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={selected.status === "rejected"}
                      onClick={() => updateStatus(selected.id, "rejected")}
                      className="text-red-600"
                    >
                      ❌ Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}