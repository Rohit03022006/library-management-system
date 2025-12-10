import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Edit3,
  Save,
  X,
  Trash2,
  UserCheck,
  UserX,
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Bookmark,
  History,
  Download,
  CreditCard,
  Loader2,
} from "lucide-react";
import { usersAPI, borrowAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, hasPermission } = useAuth();

  const [user, setUser] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [currentBorrows, setCurrentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userRes, borrowsRes, currentRes] = await Promise.all([
        usersAPI.getById(id),
        borrowAPI.getAll({ userId: id, limit: 50 }),
        borrowAPI.getAll({ userId: id, status: "borrowed" }),
      ]);

      const userData = userRes.data.user;
      setUser(userData);
      setFormData(userData);
      setBorrowHistory(borrowsRes.data.borrowRecords || []);
      setCurrentBorrows(currentRes.data.borrowRecords || []);

      const totalBorrowed = borrowsRes.data.borrowRecords?.length || 0;
      const totalReturned =
        borrowsRes.data.borrowRecords?.filter((b) => b.status === "returned")
          .length || 0;
      const totalOverdue =
        borrowsRes.data.borrowRecords?.filter((b) => b.status === "overdue")
          .length || 0;
      const totalFines =
        borrowsRes.data.borrowRecords?.reduce(
          (sum, b) => sum + (b.fineAmount || 0),
          0
        ) || 0;

      setStats({
        totalBorrowed,
        totalReturned,
        totalOverdue,
        totalFines,
        currentBorrows: currentRes.data.borrowRecords?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await usersAPI.update(id, formData);
      setUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteUser = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${user.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await usersAPI.delete(id);
      navigate("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleToggleStatus = async () => {
    try {
      const action = user.isActive ? "deactivate" : "activate";
      const response = await usersAPI[action](id);
      setUser(response.data.user);
      setFormData(response.data.user);
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Failed to update user status");
    }
  };

  const handleReturnBook = async (borrowId) => {
    try {
      await borrowAPI.return(borrowId);
      fetchUserData(); 
    } catch (error) {
      console.error("Error returning book:", error);
      alert("Failed to return book");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      borrowed: "bg-primary/10 text-primary border-primary/20",
      returned: "bg-muted text-muted-foreground border-transparent",
      overdue: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status] || styles.returned
        } capitalize`}
      >
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-secondary text-secondary-foreground border border-border uppercase tracking-wider">
        <Shield className="h-3 w-3" />
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Loading user profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border text-center shadow-lg">
          <CardContent className="p-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              User Not Found
            </h3>
            <p className="text-muted-foreground mb-8">
              The user you are looking for does not exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/users")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/users")}
              className="group border-input bg-background hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                  ID: {user.membershipId}
                </span>
                {getRoleBadge(user.role)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {hasPermission("admin") && (
              <>
                <Button
                  variant="outline"
                  onClick={handleToggleStatus}
                  className={`border-input hover:bg-muted ${
                    !user.isActive &&
                    "text-green-600 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  {user.isActive ? (
                    <UserX className="h-4 w-4 mr-2" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  {user.isActive ? "Deactivate" : "Activate Account"}
                </Button>

                <Button
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleDeleteUser}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            <Button variant="secondary" className="shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              <Card className="border border-border shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-24 bg-muted/50 border-b border-border relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-foreground via-transparent to-transparent"></div>
                </div>
                <CardContent className="px-6 pb-6 pt-0 text-center relative">
                  <div className="relative -mt-12 inline-block mb-4">
                    <div className="w-24 h-24 rounded-full bg-background border-4 border-background shadow-sm flex items-center justify-center overflow-hidden">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div
                      className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-background ${
                        user.isActive ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    ></div>
                  </div>

                  {!editing ? (
                    <>
                      <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {user.email}
                      </p>

                      <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {stats.totalBorrowed}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Total Books
                          </p>
                        </div>
                        <div className="text-center border-l border-border">
                          <p className="text-2xl font-bold">
                            {stats.currentBorrows}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Active
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 text-left mt-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">
                          Full Name
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">
                          Email
                        </label>
                        <Input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  )}

                  {hasPermission("admin") && (
                    <div className="pt-6 mt-6 border-t border-border">
                      {!editing ? (
                        <Button
                          variant="outline"
                          className="w-full border-dashed border-input hover:border-primary hover:bg-muted"
                          onClick={() => setEditing(true)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-primary text-primary-foreground"
                            onClick={handleSave}
                          >
                            <Save className="h-4 w-4 mr-2" /> Save
                          </Button>
                          <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {!editing ? (
                    <>
                      <div className="flex items-center gap-3 text-sm group">
                        <div className="p-2 rounded-md bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm group">
                        <div className="p-2 rounded-md bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Phone className="h-4 w-4" />
                        </div>
                        <span>{user.phone || "Not provided"}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm group">
                        <div className="p-2 rounded-md bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-0.5">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="leading-relaxed">
                          {user.address || "No address on file"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        prefix={<Phone className="h-4 w-4" />}
                      />
                      <Input
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        placeholder="Address"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border border-border bg-card hover:border-primary/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Total Borrowed
                    </p>
                    <BookOpen className="h-4 w-4 text-primary opacity-70" />
                  </div>
                  <p className="text-2xl font-bold">{stats.totalBorrowed}</p>
                </CardContent>
              </Card>
              <Card className="border border-border bg-card hover:border-primary/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Returned
                    </p>
                    <CheckCircle className="h-4 w-4 text-primary opacity-70" />
                  </div>
                  <p className="text-2xl font-bold">{stats.totalReturned}</p>
                </CardContent>
              </Card>
              <Card
                className={`border ${
                  stats.totalOverdue > 0
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border bg-card"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p
                      className={`text-xs font-medium uppercase ${
                        stats.totalOverdue > 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      Overdue
                    </p>
                    <AlertCircle
                      className={`h-4 w-4 ${
                        stats.totalOverdue > 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      stats.totalOverdue > 0
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    {stats.totalOverdue}
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border bg-card hover:border-primary/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Total Fines
                    </p>
                    <CreditCard className="h-4 w-4 text-primary opacity-70" />
                  </div>
                  <p className="text-2xl font-bold">${stats.totalFines}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-border bg-card shadow-sm min-h-[500px] flex flex-col">
              <div className="border-b border-border px-6 pt-4">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                  {["overview", "current", "history", "fines"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        relative pb-4 text-sm font-medium transition-colors whitespace-nowrap
                        ${
                          activeTab === tab
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      <span className="capitalize">
                        {tab === "current" ? "Active Loans" : tab}
                      </span>
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <CardContent className="p-6 flex-1">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div>
                          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Account Status
                          </h3>
                          <dl className="space-y-4 text-sm">
                            <div className="flex justify-between pb-3 border-b border-dashed border-border">
                              <dt className="text-muted-foreground">
                                Account Standing
                              </dt>
                              <dd className="font-medium flex items-center gap-2">
                                {stats.totalOverdue > 0 ? (
                                  <span className="text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> Action
                                    Required
                                  </span>
                                ) : (
                                  <span className="text-primary flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Good
                                    Standing
                                  </span>
                                )}
                              </dd>
                            </div>
                            <div className="flex justify-between pb-3 border-b border-dashed border-border">
                              <dt className="text-muted-foreground">
                                Joined Date
                              </dt>
                              <dd className="font-mono">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </dd>
                            </div>
                            <div className="flex justify-between pb-3 border-b border-dashed border-border">
                              <dt className="text-muted-foreground">
                                Last Activity
                              </dt>
                              <dd className="font-mono">
                                {new Date(user.updatedAt).toLocaleDateString()}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                            <History className="h-4 w-4" /> Library Activity
                          </h3>
                          <dl className="space-y-4 text-sm">
                            <div className="flex justify-between pb-3 border-b border-dashed border-border">
                              <dt className="text-muted-foreground">
                                Total Loans
                              </dt>
                              <dd className="font-medium">
                                {stats.totalBorrowed}
                              </dd>
                            </div>
                            <div className="flex justify-between pb-3 border-b border-dashed border-border">
                              <dt className="text-muted-foreground">
                                Lost Books
                              </dt>
                              <dd className="font-medium">0</dd>
                            </div>
                            <div className="flex justify-between pb-3 border-b border-dashed border-border">
                              <dt className="text-muted-foreground">
                                Outstanding Fines
                              </dt>
                              <dd
                                className={`font-mono font-bold ${
                                  stats.totalFines > 0 ? "text-destructive" : ""
                                }`}
                              >
                                ${stats.totalFines.toFixed(2)}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "current" && (
                    <motion.div
                      key="current"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {currentBorrows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mb-4 opacity-10" />
                          <p>No active loans at the moment.</p>
                        </div>
                      ) : (
                        currentBorrows.map((record) => (
                          <div
                            key={record._id}
                            className="group flex flex-col sm:flex-row items-center justify-between p-4 border border-border rounded-xl hover:shadow-md transition-all gap-4 bg-card"
                          >
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <BookOpen className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm sm:text-base">
                                  {record.book?.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  by {record.book?.author}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                  Due Date
                                </p>
                                <p
                                  className={`text-sm font-bold font-mono ${
                                    new Date(record.dueDate) < new Date()
                                      ? "text-destructive"
                                      : "text-foreground"
                                  }`}
                                >
                                  {new Date(
                                    record.dueDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {hasPermission("librarian", "admin") && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReturnBook(record._id)}
                                  className="bg-primary text-primary-foreground hover:opacity-90"
                                >
                                  Return
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}

                  {activeTab === "history" && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      {borrowHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                          <History className="h-12 w-12 mb-4 opacity-10" />
                          <p>No borrowing history found.</p>
                        </div>
                      ) : (
                        <div className="border border-border rounded-lg overflow-hidden">
                          {borrowHistory.map((record, index) => (
                            <div
                              key={record._id}
                              className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <span className="font-mono text-xs text-muted-foreground w-6">
                                  {index + 1}
                                </span>
                                <div>
                                  <h4 className="font-medium text-sm">
                                    {record.book?.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                      Borrowed:{" "}
                                      {new Date(
                                        record.borrowDate
                                      ).toLocaleDateString()}
                                    </span>
                                    {record.returnDate && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          Returned:{" "}
                                          {new Date(
                                            record.returnDate
                                          ).toLocaleDateString()}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                {getStatusBadge(record.status)}
                                {record.fineAmount > 0 && (
                                  <span className="text-xs font-mono text-destructive">
                                    -${record.fineAmount} Fine
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "fines" && (
                    <motion.div
                      key="fines"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {stats.totalFines === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                          <CheckCircle className="h-16 w-16 mb-4 opacity-20 text-primary" />
                          <h3 className="text-lg font-bold text-foreground">
                            Clean Record
                          </h3>
                          <p>No outstanding fines. User is in good standing.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10">
                          <div className="w-full max-w-md bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center">
                            <h4 className="text-destructive font-bold uppercase tracking-widest text-xs mb-2">
                              Total Amount Due
                            </h4>
                            <p className="text-5xl font-bold mb-8 text-destructive">
                              ${stats.totalFines.toFixed(2)}
                            </p>

                            <div className="flex flex-col gap-3">
                              {hasPermission("librarian", "admin") && (
                                <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 text-base">
                                  Process Payment
                                </Button>
                              )}
                              <Button variant="outline" className="w-full">
                                View Breakdown
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
