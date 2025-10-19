"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const stats = {
    totalApplications: 24,
    activeApplications: 18,
    interviews: 6,
    offers: 2,
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm md:text-base text-neutral-500">
          Track your job applications and interview progress
        </p>
      </div>

      {/* Stats Cards - Mobile optimized */}
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
    </motion.div>
  );
}
