import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { Eye, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Certificates() {

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    address: "",
    document_type: "",
    purpose: "",
    company_name: "",
    business_nature: "",
  });

  const isBusiness =
  form.document_type === "Business Permit" ||
  form.document_type === "Business Clearance" ||
  form.document_type === "Mayor's Permit Endorsement";

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  const user = getUser();

  // FETCH
  useEffect(() => {
    fetchCertificates(1, "");
  }, []);

  const fetchCertificates = async (pageNum = 1, searchTerm = search) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://ajcpisonet.com/api/certificates?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = await res.json();

      setCertificates(result.data || []);
      setPage(result.current_page || 1);
      setLastPage(result.last_page || 1);
    } catch (err) {
      toast.error("Error loading certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://ajcpisonet.com/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed");
        return;
      }

      toast.success("Created successfully");

      setShowModal(false);

      setForm({
        full_name: "",
        age: "",
        gender: "",
        address: "",
        document_type: "",
        purpose: "",
        company_name: "",
        business_nature: "",
      });

      fetchCertificates(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this certificate?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://ajcpisonet.com/api/certificates/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        toast.error("Failed to delete");
        return;
      }

      toast.success("Deleted");
      fetchCertificates(page, search);
    } catch {
      toast.error("Error deleting");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://ajcpisonet.com/api/certificates/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        toast.error("Failed update");
        return;
      }

      toast.success("Updated");
      setShowActionModal(false);
      fetchCertificates(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  const getPages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-gray-900">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-3">

        <div className="relative w-full md:w-[360px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />

          <Input
            className="bg-white pl-9 pr-9"
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchCertificates(1, e.target.value);
            }}
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchCertificates(1, "");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => setShowModal(true)}
        >
          Add Certificate
        </Button>
      </div>

      {/* TABLE */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
             <Table className="text-sm">
                <TableHeader className="bg-gray-100">
                  <TableRow className="border-b border-gray-200 hover:bg-gray-100">

                    <TableHead className="h-9 px-3 py-2 text-xs font-semibold text-gray-600 w-[60px]">
                      #
                    </TableHead>

                    <TableHead className="h-9 px-3 py-2 text-xs font-semibold text-gray-600">
                      Name
                    </TableHead>

                    <TableHead className="h-9 px-3 py-2 text-xs font-semibold text-gray-600">
                      Document
                    </TableHead>

                    <TableHead className="h-9 px-3 py-2 text-xs font-semibold text-gray-600">
                      Purpose
                    </TableHead>

                    <TableHead className="h-9 px-3 py-2 text-xs font-semibold text-gray-600 w-[120px]">
                      Status
                    </TableHead>

                    <TableHead className="h-9 px-3 py-2 text-xs font-semibold text-gray-600 text-right w-[120px]">
                      Actions
                    </TableHead>

                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-16 text-center text-sm text-gray-500"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : certificates.length > 0 ? (
                    certificates.map((c, i) => (
                      <TableRow
                        key={c.id}
                        className="border-b border-gray-100 hover:bg-gray-100 transition-colors"
                      >

                        {/* NUMBER */}
                        <TableCell className="px-3 py-2 text-xs text-gray-700">
                          {(page - 1) * 10 + i + 1}
                        </TableCell>

                        {/* NAME */}
                        <TableCell className="px-3 py-2 text-sm font-medium text-gray-900">
                          {c.full_name}
                        </TableCell>

                        {/* DOCUMENT */}
                        <TableCell className="px-3 py-2 text-sm text-gray-700">
                          {c.document_type}
                        </TableCell>

                        {/* PURPOSE */}
                        <TableCell className="px-3 py-2 text-sm text-gray-500">
                          {c.purpose}
                        </TableCell>

                        {/* STATUS */}
                        <TableCell className="px-3 py-2">
                          <Badge
                            className={
                              c.status === "approved"
                                ? "bg-green-500 text-white hover:bg-green-500"
                                : c.status === "rejected"
                                ? "bg-red-500 text-white hover:bg-red-500"
                                : "bg-yellow-400 text-black hover:bg-yellow-400"
                            }
                          >
                            {c.status}
                          </Badge>
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell className="px-3 py-2">
                          <div className="flex justify-end gap-2">

                            {/* VIEW */}
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 border-gray-200 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedCert(c);
                                setShowActionModal(true);
                              }}
                            >
                              <Eye size={15} />
                            </Button>

                            {/* DELETE */}
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => handleDelete(c.id)}
                            >
                              <Trash2 size={15} />
                            </Button>

                          </div>
                        </TableCell>

                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-16 text-center text-sm text-gray-500"
                      >
                        No certificates found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 flex-wrap">

        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => fetchCertificates(page - 1, search)}
        >
          Prev
        </Button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-gray-400">...</span>
          ) : (
            <Button
              key={i}
              variant={p === page ? "default" : "outline"}
              className={p === page ? "bg-orange-500 hover:bg-orange-600" : ""}
              onClick={() => fetchCertificates(p, search)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          disabled={page === lastPage}
          onClick={() => fetchCertificates(page + 1, search)}
        >
          Next
        </Button>

      </div>

  
      {/* ADD MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white text-gray-900 border border-gray-200 shadow-xl rounded-2xl w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
  
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add Certificate
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* FULL NAME */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Full Name
              </label>
              <Input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="bg-white"
              />
            </div>

            {/* AGE */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Age
              </label>
              <Input
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                className="bg-white"
              />
            </div>

            {/* GENDER */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* ADDRESS */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Address
              </label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="bg-white"
              />
            </div>

            {/* DOCUMENT TYPE (FIXED LONG TEXT ISSUE) */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Document Type
              </label>

              <select
                name="document_type"
                value={form.document_type}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="">Select Document Type</option>

                <option value="Barangay Clearance">Barangay Clearance</option>
                <option value="Certificate of Residency">Certificate of Residency</option>
                <option value="Certificate of Indigency">Certificate of Indigency</option>
                <option value="Certificate of Low Income">Certificate of Low Income</option>
                <option value="Certificate of Good Moral Character">Certificate of Good Moral Character</option>
                <option value="Certificate of Appearance">Certificate of Appearance</option>
                <option value="Certificate of Solo Parent">Certificate of Solo Parent</option>
                <option value="Certificate of Cohabitation">Certificate of Cohabitation</option>
                <option value="Certificate of Unemployment">Certificate of Unemployment</option>
                <option value="Certificate of Residency for Voter Registration">
                  Certificate of Residency for Voter Registration
                </option>

                <option value="Business Permit">Business Permit</option>
                <option value="Business Clearance">Business Clearance</option>
                <option value="Mayor's Permit Endorsement">Mayor's Permit Endorsement</option>

                <option value="Barangay Blotter">Barangay Blotter</option>
                <option value="Certificate to File Action">Certificate to File Action</option>

                <option value="Fence Clearance">Fence Clearance</option>
                <option value="Building Clearance">Building Clearance</option>
                <option value="Excavation Clearance">Excavation Clearance</option>

                <option value="Travel Permit">Travel Permit</option>

                <option value="Disaster Assistance Certificate">Disaster Assistance Certificate</option>
                <option value="Calamity Assistance Certificate">Calamity Assistance Certificate</option>
              </select>
            </div>

            {/* PURPOSE */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Purpose
              </label>
              <Input
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                className="bg-white"
              />
            </div>
            {/* ✅ BUSINESS FIELDS (FIXED LOGIC) */}
            {(
              form.document_type === "Business Permit" ||
              form.document_type === "Business Clearance" ||
              form.document_type === "Mayor's Permit Endorsement"
            ) && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Company Name
                  </label>
                  <Input
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Business Nature
                  </label>
                  <Input
                    name="business_nature"
                    value={form.business_nature}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>

            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleSubmit}
            >
              Save Certificate
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="bg-white text-gray-900 border border-gray-200 shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-2 text-sm">
              <p><b>Name:</b> {selectedCert.full_name}</p>
              <p><b>Status:</b> {selectedCert.status}</p>
              <p><b>Document:</b> {selectedCert.document_type}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">

            <Button
              variant="destructive"
              onClick={() => updateStatus(selectedCert.id, "rejected")}
            >
              Reject
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => updateStatus(selectedCert.id, "approved")}
            >
              Approve
            </Button>

          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}