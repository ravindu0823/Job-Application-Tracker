"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, CheckCircle2, X, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 6000); // Auto hide after 6s
    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const stats = {
    totalApplications: 24,
    activeApplications: 18,
    interviews: 6,
    offers: 2,
  };

  const allApplications = [
    { title: "Software Engineer", company: "Tech Company Inc.", status: "Applied" },
    { title: "Frontend Developer", company: "Startup XYZ", status: "Interview" },
    { title: "Full Stack Engineer", company: "Enterprise Corp", status: "Offer" },
    { title: "UI Designer", company: "Creative Studio", status: "Applied" },
    { title: "Backend Developer", company: "DevWorks", status: "Applied" },
  ];

  const getApplicationsByCategory = (category: string) => {
    switch (category) {
      case "Total Applications":
        return allApplications;
      case "Active Applications":
        return allApplications.filter(app => app.status !== "Offer");
      case "Interviews Scheduled":
        return allApplications.filter(app => app.status === "Interview");
      case "Offers Received":
        return allApplications.filter(app => app.status === "Offer");
      default:
        return [];
    }
  };

  const handleDownload = () => {
    const data = JSON.stringify(getApplicationsByCategory(selectedCategory || ""), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedCategory?.replace(/\s+/g, "_") || "applications"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="space-y-6 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* 🔔 Guide Tooltip in top-right corner */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            className="fixed top-6 right-6 bg-blue-300 text-black px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              New feature! You can now download your applications 📂
            </span>
            <button
              onClick={() => setShowGuide(false)}
              className="ml-2 hover:text-gray-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm md:text-base text-neutral-500">
          Track your job applications and interview progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Applications",
            value: stats.totalApplications,
            icon: <Briefcase className="h-4 w-4 text-neutral-500" />,
            desc: "All time applications",
            hoverColor: "blue",
          },
          {
            title: "Active Applications",
            value: stats.activeApplications,
            icon: <Briefcase className="h-4 w-4 text-blue-500" />,
            desc: "In progress",
            hoverColor: "blue",
          },
          {
            title: "Interviews Scheduled",
            value: stats.interviews,
            icon: <Calendar className="h-4 w-4 text-yellow-500" />,
            desc: "Upcoming interviews",
            hoverColor: "yellow",
          },
          {
            title: "Offers Received",
            value: stats.offers,
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            desc: "Job offers",
            hoverColor: "green",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
            whileHover={{
              scale: 1.02,
              y: -2,
              transition: { duration: 0.25, ease: "easeOut" },
            }}
            onClick={() => setSelectedCategory(item.title)}
            className="cursor-pointer"
          >
            <Card className="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-500 ease-out rounded-lg backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle
                  className={`text-xs md:text-sm font-medium transition-colors duration-500 ease-in-out group-hover:text-${item.hoverColor}-600`}
                >
                  {item.title}
                </CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold transition-all duration-700 ease-out">
                  {item.value}
                </div>
                <p className="text-xs text-neutral-500 transition-colors duration-500 ease-in-out">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        {/* Recent Applications */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="md:col-span-1 lg:col-span-4"
        >
          <Card className="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-500 ease-out rounded-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Software Engineer",
                    company: "Tech Company Inc.",
                    status: "Applied",
                    color: "blue",
                  },
                  {
                    title: "Frontend Developer",
                    company: "Startup XYZ",
                    status: "Interview",
                    color: "yellow",
                  },
                  {
                    title: "Full Stack Engineer",
                    company: "Enterprise Corp",
                    status: "Offer",
                    color: "green",
                  },
                ].map((app, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(240,240,240,0.5)",
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-center p-2 rounded-lg transition-all duration-500 ease-in-out cursor-pointer"
                  >
                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{app.title}</p>
                      <p className="text-sm text-neutral-500 truncate">{app.company}</p>
                    </div>
                    <div className="ml-auto font-medium flex-shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-${app.color}-800 bg-${app.color}-100 transition-all duration-700 ease-in-out transform hover:scale-105`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Interviews */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="md:col-span-1 lg:col-span-3"
        >
          <Card className="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-500 ease-out rounded-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Technical Interview", time: "Tomorrow at 2:00 PM" },
                  { title: "HR Round", time: "Friday at 10:00 AM" },
                ].map((interview, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(240,240,240,0.5)",
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col space-y-1 p-2 rounded-lg transition-all duration-500 ease-in-out cursor-pointer"
                  >
                    <p className="text-sm font-medium leading-none">{interview.title}</p>
                    <p className="text-sm text-neutral-500">{interview.time}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Popup Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 w-full max-w-lg"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                  {selectedCategory}
                </h3>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {getApplicationsByCategory(selectedCategory).map((app, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                        {app.title}
                      </p>
                      <p className="text-xs text-neutral-500">{app.company}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  <Download className="w-4 h-4" /> Download All
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
