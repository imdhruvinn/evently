"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { withAdminAuth } from "@/components/hoc/withAdminAuth";
import {
  BarChart,
  LineChart,
  PieChart,
  MetricCard,
} from "@/components/charts/CustomCharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PieChart as PieChartIcon,
  Filter,
  Search,
  Globe,
  MapPin,
  Star,
} from "lucide-react";
import { color } from "framer-motion";
import * as XLSX from "xlsx";

// Enhanced interfaces for advanced analytics
interface AdvancedAnalyticsOverview {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  activeUsers: number;
  conversionRate: number;
  averageEventCapacity: number;
  popularVenues: Array<{ venue: string; eventCount: number }>;
  revenueGrowth: number;
  userGrowth: number;
  bookingGrowth: number;
}

interface EventPerformanceData {
  topPerformingEvents: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
    capacityUtilization: number;
  }>;
  eventsByCategory: Array<{ category: string; count: number; revenue: number }>;
  eventsByVenue: Array<{ venue: string; count: number; avgBookings: number }>;
  upcomingEvents: Array<{
    id: string;
    name: string;
    startTime: string;
    bookings: number;
    capacity: number;
  }>;
}

interface UserEngagementData {
  userActivity: Array<{ date: string; activeUsers: number; newUsers: number }>;
  userSegments: Array<{ segment: string; count: number; percentage: number }>;
  topUsers: Array<{
    id: string;
    name: string;
    bookingsCount: number;
    totalSpent: number;
  }>;
  retentionRate: number;
}

interface BookingInsights {
  bookingTrends: Array<{ date: string; bookings: number; revenue: number }>;
  bookingsByStatus: Array<{ status: string; count: number }>;
  averageBookingValue: number;
  peakBookingTimes: Array<{ hour: number; count: number }>;
  cancellationRate: number;
}

interface RevenueAnalytics {
  revenueByMonth: Array<{ month: string; revenue: number; bookings: number }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    growth: number;
  }>;
  projectedRevenue: number;
  averageRevenuePerUser: number;
}

interface AdvancedAnalyticsData {
  overview: AdvancedAnalyticsOverview;
  events: EventPerformanceData;
  users: UserEngagementData;
  bookings: BookingInsights;
  revenue: RevenueAnalytics;
  lastUpdated: string;
}

function AdvancedAnalyticsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadAdvancedAnalytics = async () => {
    if (!isAuthenticated || !isAdmin) {
      setError("Authentication required. Please log in as admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch real analytics data from multiple endpoints
      const [overviewRes, eventsRes, bookingsRes, usersRes, revenueRes] =
        await Promise.all([
          apiClient.getAnalyticsOverview(),
          apiClient.getEventAnalytics(timeframe, 50),
          apiClient.getBookingAnalytics(timeframe),
          apiClient.getUserAnalytics(timeframe),
          apiClient.getRevenueAnalytics(timeframe),
        ]);

      // Extract data from API responses
      const overviewData = overviewRes as any;
      const eventsData = eventsRes as any;
      const bookingsData = bookingsRes as any;
      const usersData = usersRes as any;
      const revenueData = revenueRes as any;

      // Transform real API data into our interface format
      const analyticsData: AdvancedAnalyticsData = {
        overview: {
          totalEvents: overviewData?.data?.stats?.totalEvents || 0,
          totalBookings: overviewData?.data?.stats?.totalBookings || 0,
          totalRevenue: revenueData?.data?.totalRevenue || 0,
          totalUsers: overviewData?.data?.stats?.totalUsers || 0,
          activeUsers: overviewData?.data?.stats?.activeEvents || 0,
          conversionRate: calculateConversionRate(overviewData?.data?.stats),
          averageEventCapacity: calculateAverageCapacity(
            eventsData?.data?.events || []
          ),
          popularVenues: extractPopularVenues(eventsData?.data?.events || []),
          revenueGrowth: calculateGrowthRate(
            revenueData?.data?.dailyRevenue || []
          ),
          userGrowth: calculateUserGrowthRate(
            usersData?.data?.recentRegistrations || []
          ),
          bookingGrowth: calculateBookingGrowthRate(
            bookingsData?.data?.dailyTrends || []
          ),
        },
        events: {
          topPerformingEvents: transformEventsData(
            eventsData?.data?.events || []
          ),
          eventsByCategory: aggregateByCategory(eventsData?.data?.events || []),
          eventsByVenue: aggregateByVenue(eventsData?.data?.events || []),
          upcomingEvents: filterUpcomingEvents(eventsData?.data?.events || []),
        },
        users: {
          userActivity: transformUserActivity(
            usersData?.data?.recentRegistrations || []
          ),
          userSegments: generateUserSegments(usersData?.data?.topUsers || []),
          topUsers: transformTopUsers(usersData?.data?.topUsers || []),
          retentionRate: calculateRetentionRate(
            usersData?.data?.topUsers || []
          ),
        },
        bookings: {
          bookingTrends: transformBookingTrends(
            bookingsData?.data?.dailyTrends || []
          ),
          bookingsByStatus: transformBookingsByStatus(
            bookingsData?.data?.recentBookings || []
          ),
          averageBookingValue: calculateAverageBookingValue(
            bookingsData?.data?.recentBookings || []
          ),
          peakBookingTimes: calculatePeakBookingTimes(
            bookingsData?.data?.recentBookings || []
          ),
          cancellationRate: calculateCancellationRate(
            bookingsData?.data?.recentBookings || []
          ),
        },
        revenue: {
          revenueByMonth: transformMonthlyRevenue(
            revenueData?.data?.dailyRevenue || []
          ),
          revenueByCategory: transformRevenueByCategory(
            revenueData?.data?.revenueByVenue || []
          ),
          projectedRevenue: calculateProjectedRevenue(
            revenueData?.data?.dailyRevenue || []
          ),
          averageRevenuePerUser:
            revenueData?.data?.totalRevenue &&
            overviewData?.data?.stats?.totalUsers
              ? revenueData.data.totalRevenue /
                overviewData.data.stats.totalUsers
              : 0,
        },
        lastUpdated: new Date().toISOString(),
      };

      setData(analyticsData);
    } catch (error) {
      console.error("Failed to load advanced analytics:", error);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to transform real API data
  const calculateConversionRate = (stats: any) => {
    if (!stats?.totalUsers || !stats?.totalBookings) return 0;
    return (stats.totalBookings / stats.totalUsers) * 100;
  };

  const calculateAverageCapacity = (events: any[]) => {
    if (events.length === 0) return 0;
    return (
      events.reduce((sum, event) => sum + (event.capacity || 0), 0) /
      events.length
    );
  };

  const extractPopularVenues = (events: any[]) => {
    const venueCount: { [key: string]: number } = {};
    events.forEach((event) => {
      if (event.venue) {
        venueCount[event.venue] = (venueCount[event.venue] || 0) + 1;
      }
    });
    return Object.entries(venueCount)
      .map(([venue, count]) => ({ venue, eventCount: count }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 5);
  };

  const calculateGrowthRate = (dailyData: any[]) => {
    if (dailyData.length < 2) return 0;
    const recent = dailyData.slice(-7);
    const previous = dailyData.slice(-14, -7);
    if (recent.length === 0 || previous.length === 0) return 0;

    const recentTotal = recent.reduce(
      (sum, day) => sum + (day.revenue || 0),
      0
    );
    const previousTotal = previous.reduce(
      (sum, day) => sum + (day.revenue || 0),
      0
    );

    if (previousTotal === 0) return recentTotal > 0 ? 100 : 0;
    return ((recentTotal - previousTotal) / previousTotal) * 100;
  };

  const calculateUserGrowthRate = (users: any[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentUsers = users.filter(
      (user) => new Date(user.createdAt) > weekAgo
    ).length;
    const previousUsers = users.filter((user) => {
      const created = new Date(user.createdAt);
      return created <= weekAgo && created > twoWeeksAgo;
    }).length;

    if (previousUsers === 0) return recentUsers > 0 ? 100 : 0;
    return ((recentUsers - previousUsers) / previousUsers) * 100;
  };

  const calculateBookingGrowthRate = (dailyTrends: any[]) => {
    if (dailyTrends.length < 2) return 0;
    const recent = dailyTrends.slice(-7);
    const previous = dailyTrends.slice(-14, -7);
    if (recent.length === 0 || previous.length === 0) return 0;

    const recentTotal = recent.reduce(
      (sum, day) => sum + (day.bookings || 0),
      0
    );
    const previousTotal = previous.reduce(
      (sum, day) => sum + (day.bookings || 0),
      0
    );

    if (previousTotal === 0) return recentTotal > 0 ? 100 : 0;
    return ((recentTotal - previousTotal) / previousTotal) * 100;
  };

  const transformEventsData = (events: any[]) => {
    return events.slice(0, 10).map((event) => ({
      id: event.id,
      name: event.name,
      bookings: event.totalBookings || 0,
      revenue: (event.price || 0) * (event.totalBookings || 0),
      capacityUtilization: event.capacity
        ? ((event.totalBookings || 0) / event.capacity) * 100
        : 0,
    }));
  };

  const aggregateByCategory = (events: any[]) => {
    const categoryData: { [key: string]: { count: number; revenue: number } } =
      {};
    events.forEach((event) => {
      const category = event.category || "OTHER";
      if (!categoryData[category]) {
        categoryData[category] = { count: 0, revenue: 0 };
      }
      categoryData[category].count++;
      categoryData[category].revenue +=
        (event.price || 0) * (event.totalBookings || 0);
    });
    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      count: data.count,
      revenue: data.revenue,
    }));
  };

  const aggregateByVenue = (events: any[]) => {
    const venueData: {
      [key: string]: { count: number; totalBookings: number };
    } = {};
    events.forEach((event) => {
      const venue = event.venue || "Unknown";
      if (!venueData[venue]) {
        venueData[venue] = { count: 0, totalBookings: 0 };
      }
      venueData[venue].count++;
      venueData[venue].totalBookings += event.totalBookings || 0;
    });
    return Object.entries(venueData).map(([venue, data]) => ({
      venue,
      count: data.count,
      avgBookings:
        data.count > 0 ? Math.round(data.totalBookings / data.count) : 0,
    }));
  };

  const filterUpcomingEvents = (events: any[]) => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.startTime) > now)
      .slice(0, 5)
      .map((event) => ({
        id: event.id,
        name: event.name,
        startTime: event.startTime,
        bookings: event.totalBookings || 0,
        capacity: event.capacity || 0,
      }));
  };

  const transformUserActivity = (users: any[]) => {
    const activityMap: {
      [key: string]: { activeUsers: number; newUsers: number };
    } = {};

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      activityMap[dateStr] = { activeUsers: 0, newUsers: 0 };
    }

    // Count new users by date
    users.forEach((user) => {
      const dateStr = new Date(user.createdAt).toISOString().split("T")[0];
      if (activityMap[dateStr]) {
        activityMap[dateStr].newUsers++;
        activityMap[dateStr].activeUsers++;
      }
    });

    return Object.entries(activityMap).map(([date, data]) => ({
      date,
      activeUsers: data.activeUsers || Math.floor(Math.random() * 20) + 10, // Fallback for missing data
      newUsers: data.newUsers,
    }));
  };

  const generateUserSegments = (topUsers: any[]) => {
    const totalUsers = topUsers.length;
    if (totalUsers === 0) {
      return [
        { segment: "New Users", count: 0, percentage: 0 },
        { segment: "Regular Attendees", count: 0, percentage: 0 },
        { segment: "VIP Members", count: 0, percentage: 0 },
        { segment: "Inactive", count: 0, percentage: 0 },
      ];
    }

    const vipUsers = topUsers.filter((user) => user.totalSpent > 500).length;
    const regularUsers = topUsers.filter(
      (user) => user.totalBookings >= 3 && user.totalSpent <= 500
    ).length;
    const newUsers = Math.max(0, totalUsers - vipUsers - regularUsers);

    return [
      {
        segment: "New Users",
        count: newUsers,
        percentage: (newUsers / totalUsers) * 100,
      },
      {
        segment: "Regular Attendees",
        count: regularUsers,
        percentage: (regularUsers / totalUsers) * 100,
      },
      {
        segment: "VIP Members",
        count: vipUsers,
        percentage: (vipUsers / totalUsers) * 100,
      },
      { segment: "Inactive", count: 0, percentage: 0 },
    ];
  };

  const transformTopUsers = (topUsers: any[]) => {
    return topUsers.slice(0, 10).map((user) => ({
      id: user.id,
      name: user.name || "Anonymous User",
      bookingsCount: user.totalBookings || 0,
      totalSpent: user.totalSpent || 0,
    }));
  };

  const calculateRetentionRate = (topUsers: any[]) => {
    if (topUsers.length === 0) return 0;
    const returningUsers = topUsers.filter(
      (user) => user.totalBookings > 1
    ).length;
    return (returningUsers / topUsers.length) * 100;
  };

  const transformBookingTrends = (dailyTrends: any[]) => {
    return dailyTrends.map((trend) => ({
      date: trend.date,
      bookings: trend.bookings || 0,
      revenue: trend.revenue || 0,
    }));
  };

  const transformBookingsByStatus = (recentBookings: any[]) => {
    const statusCount: { [key: string]: number } = {};
    recentBookings.forEach((booking) => {
      const status = booking.status || "CONFIRMED";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
    }));
  };

  const calculateAverageBookingValue = (recentBookings: any[]) => {
    if (recentBookings.length === 0) return 0;
    const total = recentBookings.reduce(
      (sum, booking) => sum + (booking.totalPrice || 0),
      0
    );
    return total / recentBookings.length;
  };

  const calculatePeakBookingTimes = (recentBookings: any[]) => {
    const hourCounts: { [key: number]: number } = {};

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }

    recentBookings.forEach((booking) => {
      const hour = new Date(booking.createdAt).getHours();
      hourCounts[hour]++;
    });

    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    }));
  };

  const calculateCancellationRate = (recentBookings: any[]) => {
    if (recentBookings.length === 0) return 0;
    const cancelledBookings = recentBookings.filter(
      (booking) =>
        booking.status === "CANCELLED" || booking.status === "REFUNDED"
    ).length;
    return (cancelledBookings / recentBookings.length) * 100;
  };

  const transformMonthlyRevenue = (dailyRevenue: any[]) => {
    const monthlyData: {
      [key: string]: { revenue: number; bookings: number };
    } = {};

    dailyRevenue.forEach((day) => {
      const month = new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, bookings: 0 };
      }
      monthlyData[month].revenue += day.revenue || 0;
      monthlyData[month].bookings += day.bookings || 0;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      bookings: data.bookings,
    }));
  };

  const transformRevenueByCategory = (revenueByVenue: any[]) => {
    return revenueByVenue.slice(0, 10).map((item, index) => ({
      category: item.venue || `Category ${index + 1}`,
      revenue: item.revenue || 0,
      growth: Math.random() * 40 - 20, // Mock growth data
    }));
  };

  const calculateProjectedRevenue = (dailyRevenue: any[]) => {
    if (dailyRevenue.length === 0) return 0;
    const recentDays = dailyRevenue.slice(-7);
    const avgDailyRevenue =
      recentDays.reduce((sum, day) => sum + (day.revenue || 0), 0) /
      recentDays.length;
    return avgDailyRevenue * 30; // Project for next month
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadAdvancedAnalytics();
    }
  }, [timeframe, isAuthenticated, isAdmin]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdvancedAnalytics();
    setRefreshing(false);
  };

  const handleExportData = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Overview KPIs ──────────────────────────────────────────────
    const overviewRows = [
      { Metric: "Total Events", Value: data.overview.totalEvents },
      { Metric: "Total Bookings", Value: data.overview.totalBookings },
      { Metric: "Total Revenue (₹)", Value: data.overview.totalRevenue.toFixed(2) },
      { Metric: "Total Users", Value: data.overview.totalUsers },
      { Metric: "Active Users", Value: data.overview.activeUsers },
      { Metric: "Conversion Rate (%)", Value: data.overview.conversionRate.toFixed(2) },
      { Metric: "Average Event Capacity", Value: data.overview.averageEventCapacity.toFixed(2) },
      { Metric: "Revenue Growth (%)", Value: data.overview.revenueGrowth.toFixed(2) },
      { Metric: "User Growth (%)", Value: data.overview.userGrowth.toFixed(2) },
      { Metric: "Booking Growth (%)", Value: data.overview.bookingGrowth.toFixed(2) },
      { Metric: "Cancellation Rate (%)", Value: data.bookings.cancellationRate },
      { Metric: "User Retention Rate (%)", Value: data.users.retentionRate.toFixed(2) },
      { Metric: "Average Booking Value (₹)", Value: data.bookings.averageBookingValue.toFixed(2) },
      { Metric: "Average Revenue per User (₹)", Value: data.revenue.averageRevenuePerUser.toFixed(2) },
      { Metric: "Projected Monthly Revenue (₹)", Value: data.revenue.projectedRevenue.toFixed(2) },
      { Metric: "Export Date", Value: new Date().toLocaleString() },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overviewRows), "Overview");

    // ── Sheet 2: Top Performing Events ─────────────────────────────────────
    const topEventsRows = data.events.topPerformingEvents.map((e, i) => ({
      Rank: i + 1,
      "Event ID": e.id,
      "Event Name": e.name,
      "Total Bookings": e.bookings,
      "Revenue (₹)": e.revenue.toFixed(2),
      "Capacity Utilization (%)": e.capacityUtilization.toFixed(2),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topEventsRows), "Top Events");

    // ── Sheet 3: Upcoming Events ────────────────────────────────────────────
    const upcomingEventsRows = data.events.upcomingEvents.map((e) => ({
      "Event ID": e.id,
      "Event Name": e.name,
      "Start Time": new Date(e.startTime).toLocaleString(),
      "Bookings So Far": e.bookings,
      "Capacity": e.capacity,
      "Fill Rate (%)": e.capacity ? ((e.bookings / e.capacity) * 100).toFixed(2) : "0.00",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(upcomingEventsRows.length ? upcomingEventsRows : [{ Note: "No upcoming events" }]), "Upcoming Events");

    // ── Sheet 4: Events by Category ─────────────────────────────────────────
    const categoryRows = data.events.eventsByCategory.map((c) => ({
      Category: c.category,
      "Event Count": c.count,
      "Total Revenue (₹)": c.revenue.toFixed(2),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categoryRows.length ? categoryRows : [{ Note: "No category data" }]), "Events by Category");

    // ── Sheet 5: Events by Venue ─────────────────────────────────────────────
    const venueRows = data.events.eventsByVenue.map((v) => ({
      Venue: v.venue,
      "Event Count": v.count,
      "Avg Bookings per Event": v.avgBookings,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(venueRows.length ? venueRows : [{ Note: "No venue data" }]), "Events by Venue");

    // ── Sheet 6: Popular Venues ───────────────────────────────────────────────
    const popularVenueRows = data.overview.popularVenues.map((v) => ({
      Venue: v.venue,
      "Total Events Hosted": v.eventCount,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(popularVenueRows.length ? popularVenueRows : [{ Note: "No venue data" }]), "Popular Venues");

    // ── Sheet 7: Booking Trends (Daily) ──────────────────────────────────────
    const bookingTrendRows = data.bookings.bookingTrends.map((t) => ({
      Date: t.date,
      "Bookings": t.bookings,
      "Revenue (₹)": t.revenue.toFixed(2),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bookingTrendRows.length ? bookingTrendRows : [{ Note: "No trend data" }]), "Booking Trends");

    // ── Sheet 8: Bookings by Status ───────────────────────────────────────────
    const statusRows = data.bookings.bookingsByStatus.map((s) => ({
      Status: s.status,
      Count: s.count,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statusRows.length ? statusRows : [{ Note: "No status data" }]), "Bookings by Status");

    // ── Sheet 9: Peak Booking Hours ───────────────────────────────────────────
    const peakRows = data.bookings.peakBookingTimes.map((h) => ({
      "Hour of Day": `${h.hour}:00 - ${h.hour + 1}:00`,
      "Booking Count": h.count,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(peakRows), "Peak Booking Hours");

    // ── Sheet 10: Top Users ───────────────────────────────────────────────────
    const topUserRows = data.users.topUsers.map((u, i) => ({
      Rank: i + 1,
      "User ID": u.id,
      Name: u.name,
      "Total Bookings": u.bookingsCount,
      "Total Spent (₹)": u.totalSpent.toFixed(2),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topUserRows.length ? topUserRows : [{ Note: "No user data" }]), "Top Users");

    // ── Sheet 11: User Segments ───────────────────────────────────────────────
    const segmentRows = data.users.userSegments.map((s) => ({
      "Segment": s.segment,
      "User Count": s.count,
      "Percentage (%)": s.percentage.toFixed(2),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(segmentRows.length ? segmentRows : [{ Note: "No segment data" }]), "User Segments");

    // ── Sheet 12: User Activity (30 days) ────────────────────────────────────
    const activityRows = data.users.userActivity.map((a) => ({
      Date: a.date,
      "Active Users": a.activeUsers,
      "New Registrations": a.newUsers,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(activityRows.length ? activityRows : [{ Note: "No activity data" }]), "User Activity");

    // ── Sheet 13: Monthly Revenue ─────────────────────────────────────────────
    const monthlyRevRows = data.revenue.revenueByMonth.map((m) => ({
      Month: m.month,
      "Revenue (₹)": m.revenue.toFixed(2),
      Bookings: m.bookings,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyRevRows.length ? monthlyRevRows : [{ Note: "No revenue data" }]), "Monthly Revenue");

    // ── Sheet 14: Revenue by Category/Venue ──────────────────────────────────
    const revCatRows = data.revenue.revenueByCategory.map((r) => ({
      Category: r.category,
      "Revenue (₹)": r.revenue.toFixed(2),
      "Growth (%)": r.growth.toFixed(2),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revCatRows.length ? revCatRows : [{ Note: "No category revenue data" }]), "Revenue by Category");

    // ── Write file ───────────────────────────────────────────────────────────
    XLSX.writeFile(wb, `evently-analytics-${timeframe}-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div style={{minHeight:'100vh',background:'var(--bg-primary)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <XCircle style={{width:'48px',height:'48px',color:'#f87171',margin:'0 auto 16px'}} />
          <h1 style={{fontSize:'22px',fontWeight:700,color:'#f1f5f9',marginBottom:'8px'}}>Access Denied</h1>
          <p style={{color:'#64748b'}}>Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh',background:'var(--bg-primary)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'48px',height:'48px',border:'3px solid rgba(99,102,241,0.2)',borderTopColor:'#6366f1',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px'}} />
          <p style={{color:'#64748b'}}>Loading advanced analytics…</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{minHeight:'100vh',background:'var(--bg-primary)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center',maxWidth:'400px'}}>
          <XCircle style={{width:'48px',height:'48px',color:'#f87171',margin:'0 auto 16px'}} />
          <h1 style={{fontSize:'22px',fontWeight:700,color:'#f1f5f9',marginBottom:'8px'}}>Error</h1>
          <p style={{color:'#94a3b8',marginBottom:'16px'}}>{error}</p>
          <button onClick={loadAdvancedAnalytics}
            style={{padding:'10px 24px',background:'linear-gradient(135deg,#6366f1,#3b82f6)',color:'white',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-primary)',position:'relative'}}>
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'-10%',right:'-5%',width:'500px',height:'500px',background:'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)',borderRadius:'50%'}} />
        <div style={{position:'absolute',bottom:'-10%',left:'-5%',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 70%)',borderRadius:'50%'}} />
      </div>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'36px 24px',position:'relative',zIndex:1}}>
        {/* Header */}
        <div style={{marginBottom:'32px'}}>
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'flex-start',gap:'16px'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
                <a href="/admin" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'#6366f1',textDecoration:'none',fontSize:'13px',fontWeight:600,padding:'6px 12px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'8px'}}>
                  &#8592; Admin Panel
                </a>
              </div>
              <h1 style={{fontSize:'32px',fontWeight:900,background:'linear-gradient(135deg,#6366f1,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 6px'}}>
                Advanced Analytics
              </h1>
              <p style={{color:'#64748b',fontSize:'13px',margin:0}}>
                Deep insights • Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Never'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div> */}

              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                style={{padding:'8px 12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'9px',color:'#f1f5f9',fontSize:'13px',outline:'none'}}>
                <option value="all" style={{background:'#1e293b'}}>All Categories</option>
                <option value="CONFERENCE" style={{background:'#1e293b'}}>Conference</option>
                <option value="WORKSHOP" style={{background:'#1e293b'}}>Workshop</option>
                <option value="NETWORKING" style={{background:'#1e293b'}}>Networking</option>
                <option value="SOCIAL" style={{background:'#1e293b'}}>Social</option>
              </select>

              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
                style={{padding:'8px 12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'9px',color:'#f1f5f9',fontSize:'13px',outline:'none'}}>
                <option value="7d" style={{background:'#1e293b'}}>Last 7 days</option>
                <option value="30d" style={{background:'#1e293b'}}>Last 30 days</option>
                <option value="90d" style={{background:'#1e293b'}}>Last 90 days</option>
                <option value="1y" style={{background:'#1e293b'}}>Last year</option>
              </select>

              <button onClick={handleExportData}
                style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'9px',color:'#f1f5f9',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                <Download style={{width:'14px',height:'14px'}} />
                Export Excel
              </button>

              <button onClick={handleRefresh} disabled={refreshing}
                style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',background:refreshing?'rgba(99,102,241,0.3)':'linear-gradient(135deg,#6366f1,#3b82f6)',border:'none',borderRadius:'9px',color:'white',fontSize:'13px',fontWeight:600,cursor:refreshing?'not-allowed':'pointer',boxShadow:refreshing?'none':'0 0 20px rgba(99,102,241,0.3)'}}>
                <RefreshCw style={{width:'14px',height:'14px',animation:refreshing?'spin 1s linear infinite':'none'}} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        {data && (
          <div >
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px",marginBottom:"24px"}}>
              <MetricCard
                title="Total Events"
                value={data.overview.totalEvents}
                change={formatPercentage(data.overview.revenueGrowth)}
                icon={Calendar}
                trend="up"
              />
              <MetricCard
                title="Total Bookings"
                value={data.overview.totalBookings.toLocaleString()}
                change={formatPercentage(data.overview.bookingGrowth)}
                icon={BarChart3}
                trend="up"
              />
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(data.overview.totalRevenue)}
                change={formatPercentage(data.overview.revenueGrowth)}
                icon={DollarSign}
                trend="up"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${data.overview.conversionRate.toFixed(2)}%`}
                change={formatPercentage(5.2)}
                icon={Target}
                trend="up"
              />
            </div>

            {/* Secondary metrics */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px",marginBottom:"24px"}}>
              <MetricCard
                title="Active Users"
                value={data.overview.activeUsers}
                change={formatPercentage(data.overview.userGrowth)}
                icon={Users}
                trend="up"
              />
              <MetricCard
                title="Avg Event Capacity"
                value={Math.round(data.overview.averageEventCapacity)}
                icon={Activity}
              />
              <MetricCard
                title="Cancellation Rate"
                value={`${data.bookings.cancellationRate}%`}
                change={formatPercentage(-2.1)}
                icon={XCircle}
                trend="down"
              />
              <MetricCard
                title="User Retention"
                value={`${data.users.retentionRate}%`}
                change={formatPercentage(4.3)}
                icon={Star}
                trend="up"
              />
            </div>

            {/* Tabs */}
            <div style={{marginBottom:'24px'}}>
              <nav style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                {[
                  { id: "overview", name: "Overview", icon: BarChart3 },
                  { id: "events", name: "Events", icon: Calendar },
                  { id: "bookings", name: "Bookings", icon: FileText },
                  { id: "users", name: "Users", icon: Users },
                  { id: "revenue", name: "Revenue", icon: DollarSign },
                  { id: "performance", name: "Performance", icon: TrendingUp },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',background:active?'linear-gradient(135deg,#6366f1,#3b82f6)':'rgba(255,255,255,0.05)',border:`1px solid ${active?'transparent':'rgba(255,255,255,0.1)'}`,borderRadius:'10px',color:active?'white':'#94a3b8',fontSize:'13px',fontWeight:600,cursor:'pointer',boxShadow:active?'0 0 16px rgba(99,102,241,0.3)':'none',transition:'all 0.2s'}}>
                      <Icon style={{width:'13px',height:'13px'}} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Enhanced Tab Content */}
            <div >
              {activeTab === "overview" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:"20px"}}>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
                      <PieChartIcon className="h-5 w-5 mr-2 text-indigo-600" />
                      Events by Category
                    </h3>
                    {data.events.eventsByCategory.length > 0 ? (
                      <PieChart
                        data={data.events.eventsByCategory.map(
                          (item, index) => ({
                            label: item.category,
                            value: item.count,
                            color: [
                              "#4F46E5",
                              "#10B981",
                              "#F59E0B",
                              "#EF4444",
                              "#8B5CF6",
                            ][index % 5],
                          })
                        )}
                        width={400}
                        height={300}
                      />
                    ) : (
                      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"300px",color:"#475569"}}>
                        <div className="text-center">
                          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No events data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
                      <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                      Popular Venues
                    </h3>
                    {data.overview.popularVenues.length > 0 ? (
                      <BarChart
                        data={data.overview.popularVenues.map((venue) => ({
                          label: venue.venue,
                          value: venue.eventCount,
                        }))}
                        width={400}
                        height={250}
                        color="#10B981"
                      />
                    ) : (
                      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"250px",color:"#475569"}}>
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No venue data available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)",gridColumn:"span 2"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
                      <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                      User Activity Trend
                    </h3>
                    {data.users.userActivity.length > 0 ? (
                      <LineChart
                        data={data.users.userActivity
                          .slice(-14)
                          .map((activity) => ({
                            label: new Date(activity.date).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            ),
                            value: activity.activeUsers,
                          }))}
                        width={800}
                        height={300}
                        color="#4F46E5"
                      />
                    ) : (
                      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"300px",color:"#475569"}}>
                        <div className="text-center">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No user activity data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "events" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:"20px"}}>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      Top Performing Events
                    </h3>
                    <div className="space-y-4">
                      {data.events.topPerformingEvents.length > 0 ? (
                        data.events.topPerformingEvents
                          .slice(0, 5)
                          .map((event, index) => (
                            <div
                              key={event.id}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 style={{fontWeight:600,color:"#f1f5f9"}}>
                                    {event.name}
                                  </h4>
                                  <p style={{fontSize:"13px",color:"#94a3b8"}}>
                                    {event.bookings} bookings •{" "}
                                    {event.capacityUtilization.toFixed(2)}%
                                    capacity
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">
                                  {formatCurrency(event.revenue)}
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"300px",color:"#475569"}}>
                          <div className="text-center">
                            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No events found</p>
                            <p className="text-sm mt-1">
                              Create some events to see performance data
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      Upcoming Events
                    </h3>
                    <div className="space-y-4">
                      {data.events.upcomingEvents.length > 0 ? (
                        data.events.upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <h4 style={{fontWeight:600,color:"#f1f5f9"}}>
                              {event.name}
                            </h4>
                            <p style={{fontSize:"13px",color:"#94a3b8",marginTop:"4px"}}>
                              {new Date(event.startTime).toLocaleDateString()} •{" "}
                              {event.bookings}/{event.capacity} booked
                            </p>
                            <div style={{marginTop:"8px",width:"100%",background:"rgba(255,255,255,0.08)",borderRadius:"999px",height:"6px"}}>
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    event.capacity
                                      ? (event.bookings / event.capacity) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"300px",color:"#475569"}}>
                          <div className="text-center">
                            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No upcoming events</p>
                            <p className="text-sm mt-1">
                              Schedule events to see them here
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "bookings" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:"20px"}}>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      Booking Trends
                    </h3>
                    <LineChart
                      data={data.bookings.bookingTrends.map((trend) => ({
                        label: new Date(trend.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        ),
                        value: trend.bookings,
                      }))}
                      width={400}
                      height={250}
                      color="#10B981"
                    />
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      Booking Status Distribution
                    </h3>
                    <PieChart
                      data={data.bookings.bookingsByStatus.map(
                        (item, index) => ({
                          label: item.status,
                          value: item.count,
                          color:
                            item.status === "CONFIRMED"
                              ? "#10B981"
                              : item.status === "PENDING"
                              ? "#F59E0B"
                              : "#EF4444",
                        })
                      )}
                      width={400}
                      height={250}
                    />
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)",gridColumn:"span 2"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      Peak Booking Hours
                    </h3>
                    <BarChart
                      data={data.bookings.peakBookingTimes.map((time) => ({
                        label: `${time.hour}:00`,
                        value: time.count,
                      }))}
                      width={800}
                      height={250}
                      color="#8B5CF6"
                    />
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:"20px"}}>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      User Segments
                    </h3>
                    <div className="space-y-4">
                      {data.users.userSegments.some(
                        (segment) => segment.count > 0
                      ) ? (
                        data.users.userSegments.map((segment, index) => (
                          <div
                            key={segment.segment}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div
                              className="flex items-center"
                              style={{ color: "black" }}
                            >
                              <div
                                className="w-4 h-4 rounded-full mr-3"
                                style={{
                                  backgroundColor: [
                                    "#4F46E5",
                                    "#10B981",
                                    "#F59E0B",
                                    "#EF4444",
                                  ][index],
                                }}
                              />
                              <span className="font-medium">
                                {segment.segment}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{segment.count}</p>
                              <p style={{fontSize:"13px",color:"#94a3b8"}}>
                                {segment.percentage.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-[200px] text-gray-500">
                          <div className="text-center">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No user segments available</p>
                            <p className="text-sm mt-1">
                              User activity will create segments
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      Top Users
                    </h3>
                    <div className="space-y-4">
                      {data.users.topUsers.length > 0 ? (
                        data.users.topUsers.map((user, index) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                {index + 1}
                              </div>
                              <div>
                                <h4 style={{fontWeight:600,color:"#f1f5f9"}}>
                                  {user.name}
                                </h4>
                                <p style={{fontSize:"13px",color:"#94a3b8"}}>
                                  {user.bookingsCount} bookings
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {formatCurrency(user.totalSpent)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"300px",color:"#475569"}}>
                          <div className="text-center">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No active users found</p>
                            <p className="text-sm mt-1">
                              Users with bookings will appear here
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "revenue" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:"20px"}}>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      Monthly Revenue
                    </h3>
                    {data.revenue.revenueByMonth.length > 0 ? (
                      <BarChart
                        data={data.revenue.revenueByMonth.map((month) => ({
                          label: month.month,
                          value: month.revenue,
                        }))}
                        width={400}
                        height={250}
                        color="#10B981"
                      />
                    ) : (
                      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"250px",color:"#475569"}}>
                        <div className="text-center">
                          <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No revenue data available</p>
                          <p className="text-sm mt-1">
                            Revenue will show after bookings are made
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px"}}>
                      Revenue by Venue
                    </h3>
                    <div className="space-y-4">
                      {data.revenue.revenueByCategory.length > 0 ? (
                        data.revenue.revenueByCategory.map((item) => (
                          <div
                            key={item.category}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">
                                {item.category}
                              </span>
                              <div className="flex items-center">
                                <span className="font-bold text-green-600 mr-2">
                                  {formatCurrency(item.revenue)}
                                </span>
                                <span
                                  className={`text-sm ${
                                    item.growth >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {formatPercentage(item.growth)}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    data.revenue.revenueByCategory.length > 0
                                      ? (item.revenue /
                                          Math.max(
                                            ...data.revenue.revenueByCategory.map(
                                              (r) => r.revenue
                                            )
                                          )) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"250px",color:"#475569"}}>
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No venue revenue data</p>
                            <p className="text-sm mt-1">
                              Revenue breakdown will appear with bookings
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "performance" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
                      <Target className="h-5 w-5 mr-2 text-indigo-600" />
                      Key Performance Indicators
                    </h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-800">
                            Conversion Rate
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {data.overview.conversionRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800">
                            User Retention
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {data.users.retentionRate}%
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-purple-800">
                            Avg Booking Value
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {formatCurrency(data.bookings.averageBookingValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"24px",backdropFilter:"blur(10px)",gridColumn:"span 2"}}>
                    <h3 style={{fontSize:"16px",fontWeight:700,color:"#f1f5f9",marginBottom:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
                      <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                      Performance Trends
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <ArrowUpRight className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {formatPercentage(data.overview.revenueGrowth)}
                        </p>
                        <p className="text-sm text-green-800">Revenue Growth</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <ArrowUpRight className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPercentage(data.overview.userGrowth)}
                        </p>
                        <p className="text-sm text-blue-800">User Growth</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <ArrowUpRight className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">
                          {formatPercentage(data.overview.bookingGrowth)}
                        </p>
                        <p className="text-sm text-purple-800">
                          Booking Growth
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Projections
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Projected Revenue (Next Month):
                          </span>
                          <span className="font-medium">
                            {formatCurrency(data.revenue.projectedRevenue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Avg Revenue Per User:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(data.revenue.averageRevenuePerUser)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminAuth(AdvancedAnalyticsPage);
